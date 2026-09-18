import {
  recordLeadHandoff,
  type LeadHandoffDatabaseConfig,
} from "./lead-handoff-repository.ts";
import { corsHeaders, isOriginAllowed } from "./http.ts";

export const MAX_HANDOFF_REQUEST_BYTES = 1024;
const publicCodePattern = /^AT-[0-9]{2}-[A-Z0-9]{6}$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type HandoffRateLimiter = Readonly<{
  consume(key: string): boolean;
}>;

export function createHandoffRateLimiter(
  maximum = 12,
  windowMilliseconds = 60_000,
): HandoffRateLimiter {
  const entries = new Map<string, { count: number; resetAt: number }>();
  return {
    consume(key) {
      const now = Date.now();
      const current = entries.get(key);
      if (!current || current.resetAt <= now) {
        if (!current && entries.size >= 1000) {
          for (const [entryKey, entry] of entries) {
            if (entry.resetAt <= now) entries.delete(entryKey);
          }
          if (entries.size >= 1000) {
            const oldestKey = entries.keys().next().value;
            if (oldestKey) entries.delete(oldestKey);
          }
        }
        entries.set(key, { count: 1, resetAt: now + windowMilliseconds });
        return true;
      }
      if (current.count >= maximum) return false;
      current.count += 1;
      return true;
    },
  };
}

const defaultRateLimiter = createHandoffRateLimiter();

function response(
  origin: string,
  status: number,
  body: Record<string, unknown>,
) {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders(origin),
      "Cache-Control": "no-store",
    },
  });
}

function parsePayload(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const record = value as Record<string, unknown>;
  if (
    Object.keys(record).sort().join(",") !== "publicCode,submissionId" ||
    typeof record.submissionId !== "string" ||
    !uuidPattern.test(record.submissionId) ||
    typeof record.publicCode !== "string" ||
    !publicCodePattern.test(record.publicCode)
  ) {
    return;
  }
  return {
    submissionId: record.submissionId,
    publicCode: record.publicCode,
  };
}

export async function handleLeadHandoff(
  request: Request,
  config: LeadHandoffDatabaseConfig | undefined,
  allowedOrigins: readonly string[],
  fetcher: typeof fetch = fetch,
  rateLimiter: HandoffRateLimiter = defaultRateLimiter,
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

  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  if (contentLength > MAX_HANDOFF_REQUEST_BYTES) {
    return response(safeOrigin, 413, {
      success: false,
      code: "REQUEST_TOO_LARGE",
    });
  }

  let payload: ReturnType<typeof parsePayload>;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_HANDOFF_REQUEST_BYTES) {
      return response(safeOrigin, 413, {
        success: false,
        code: "REQUEST_TOO_LARGE",
      });
    }
    payload = parsePayload(JSON.parse(raw));
  } catch {
    payload = undefined;
  }
  if (!payload) {
    return response(safeOrigin, 400, {
      success: false,
      code: "INVALID_REQUEST",
    });
  }
  if (!rateLimiter.consume(`${payload.submissionId}:${payload.publicCode}`)) {
    return response(safeOrigin, 429, {
      success: false,
      code: "RATE_LIMITED",
    });
  }
  if (!config) {
    return response(safeOrigin, 503, {
      success: false,
      code: "SERVICE_UNAVAILABLE",
    });
  }

  try {
    await recordLeadHandoff(
      payload.submissionId,
      payload.publicCode,
      config,
      fetcher,
    );
    // A valid but unmatched identifier pair is intentionally indistinguishable
    // from a recorded handoff so this public endpoint cannot be used as a lead
    // existence oracle. The SQL function remains responsible for the write.
    return response(safeOrigin, 200, { success: true });
  } catch {
    return response(safeOrigin, 503, {
      success: false,
      code: "SERVICE_UNAVAILABLE",
    });
  }
}
