import {
  applyAdminLeadAction,
  AdminLeadActionRepositoryError,
  type AdminLeadActionCommand,
  type AdminLeadActionDatabaseConfig,
} from "./admin-lead-actions-repository.ts";
import { adminLeadStatuses, type AdminLeadStatus } from "./admin-lead-types.ts";
import { isOriginAllowed } from "./http.ts";

export type AdminLeadActionsConfig = AdminLeadActionDatabaseConfig &
  Readonly<{
    publishableKey: string;
    adminUserIds: readonly string[];
  }>;

export const MAX_ADMIN_ACTION_REQUEST_BYTES = 8 * 1024;
export const MAX_ADMIN_NOTE_LENGTH = 2000;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const publicCodePattern = /^AT-[0-9]{2}-[A-Z0-9]{6}$/;

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function response(
  origin: string,
  status: number,
  body: Record<string, unknown>,
) {
  return Response.json(body, {
    status,
    headers: { ...corsHeaders(origin), "Cache-Control": "no-store" },
  });
}

function bearerToken(request: Request) {
  const match = /^Bearer\s+([^\s]+)$/i.exec(
    request.headers.get("Authorization") ?? "",
  );
  return match?.[1];
}

async function authenticatedUserId(
  token: string,
  config: AdminLeadActionsConfig,
  fetcher: typeof fetch,
) {
  const authResponse = await fetcher(`${config.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!authResponse.ok) return;
  const user = (await authResponse.json()) as { id?: unknown };
  return typeof user.id === "string" && uuidPattern.test(user.id)
    ? user.id
    : undefined;
}

function exactKeys(record: Record<string, unknown>, expected: string[]) {
  return Object.keys(record).sort().join(",") === expected.sort().join(",");
}

export function parseAdminLeadAction(
  value: unknown,
  now = new Date(),
): AdminLeadActionCommand | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const record = value as Record<string, unknown>;
  if (
    typeof record.publicCode !== "string" ||
    !publicCodePattern.test(record.publicCode) ||
    typeof record.action !== "string"
  ) {
    return;
  }

  if (record.action === "CHANGE_STATUS") {
    if (
      !exactKeys(record, ["action", "publicCode", "status"]) ||
      typeof record.status !== "string" ||
      !adminLeadStatuses.includes(record.status as AdminLeadStatus)
    ) {
      return;
    }
    return {
      action: record.action,
      publicCode: record.publicCode,
      status: record.status as AdminLeadStatus,
    };
  }
  if (record.action === "RECORD_CONTACT") {
    return exactKeys(record, ["action", "publicCode"])
      ? { action: record.action, publicCode: record.publicCode }
      : undefined;
  }
  if (record.action === "ADD_NOTE") {
    const note = typeof record.note === "string" ? record.note.trim() : "";
    if (
      !exactKeys(record, ["action", "note", "publicCode"]) ||
      note.length < 2 ||
      note.length > MAX_ADMIN_NOTE_LENGTH ||
      /[<>]/u.test(note)
    ) {
      return;
    }
    return { action: record.action, publicCode: record.publicCode, note };
  }
  if (record.action === "SET_FOLLOW_UP") {
    if (
      !exactKeys(record, ["action", "followUpAt", "publicCode"]) ||
      typeof record.followUpAt !== "string"
    ) {
      return;
    }
    const followUpAt = new Date(record.followUpAt);
    if (
      Number.isNaN(followUpAt.getTime()) ||
      followUpAt.getTime() <= now.getTime()
    ) {
      return;
    }
    return {
      action: record.action,
      publicCode: record.publicCode,
      followUpAt: followUpAt.toISOString(),
    };
  }
  if (record.action === "CLEAR_FOLLOW_UP") {
    return exactKeys(record, ["action", "publicCode"])
      ? { action: record.action, publicCode: record.publicCode }
      : undefined;
  }
  return;
}

export async function handleAdminLeadActions(
  request: Request,
  config: AdminLeadActionsConfig | undefined,
  allowedOrigins: readonly string[],
  fetcher: typeof fetch = fetch,
) {
  const origin = request.headers.get("Origin");
  if (!isOriginAllowed(origin, [...allowedOrigins])) {
    return Response.json(
      { success: false, code: "ORIGIN_NOT_ALLOWED" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
  const safeOrigin = origin as string;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(safeOrigin),
    });
  }
  if (request.method !== "POST") {
    return response(safeOrigin, 405, {
      success: false,
      code: "METHOD_NOT_ALLOWED",
    });
  }
  if (!config) {
    return response(safeOrigin, 503, {
      success: false,
      code: "SERVICE_UNAVAILABLE",
    });
  }

  const token = bearerToken(request);
  if (!token) {
    return response(safeOrigin, 401, {
      success: false,
      code: "UNAUTHENTICATED",
    });
  }

  try {
    const userId = await authenticatedUserId(token, config, fetcher);
    if (!userId) {
      return response(safeOrigin, 401, {
        success: false,
        code: "UNAUTHENTICATED",
      });
    }
    if (!config.adminUserIds.includes(userId)) {
      return response(safeOrigin, 403, {
        success: false,
        code: "FORBIDDEN",
      });
    }

    const contentLength = Number(request.headers.get("Content-Length") ?? 0);
    if (contentLength > MAX_ADMIN_ACTION_REQUEST_BYTES) {
      return response(safeOrigin, 413, {
        success: false,
        code: "REQUEST_TOO_LARGE",
      });
    }
    let command: AdminLeadActionCommand | undefined;
    try {
      const raw = await request.text();
      if (
        new TextEncoder().encode(raw).byteLength >
        MAX_ADMIN_ACTION_REQUEST_BYTES
      ) {
        return response(safeOrigin, 413, {
          success: false,
          code: "REQUEST_TOO_LARGE",
        });
      }
      command = parseAdminLeadAction(JSON.parse(raw));
    } catch {
      command = undefined;
    }
    if (!command) {
      return response(safeOrigin, 400, {
        success: false,
        code: "INVALID_ACTION",
      });
    }

    const result = await applyAdminLeadAction(command, userId, config, fetcher);
    return response(safeOrigin, 200, { success: true, lead: result });
  } catch (error) {
    if (error instanceof AdminLeadActionRepositoryError) {
      if (error.status === 404) {
        return response(safeOrigin, 404, {
          success: false,
          code: "NOT_FOUND",
        });
      }
      if (error.status >= 400 && error.status < 500) {
        return response(safeOrigin, 409, {
          success: false,
          code: "ACTION_REJECTED",
        });
      }
    }
    return response(safeOrigin, 503, {
      success: false,
      code: "SERVICE_UNAVAILABLE",
    });
  }
}
