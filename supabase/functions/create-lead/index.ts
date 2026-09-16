import { validateLeadPayload } from "../_shared/lead-engine.ts";
import { persistLead } from "../_shared/lead-repository.ts";
import {
  corsHeaders,
  isOriginAllowed,
  MAX_REQUEST_BYTES,
  parseAllowedOrigins,
  resolveSupabaseSecretKey,
} from "../_shared/http.ts";
import {
  parseTurnstileTestMode,
  verifyTurnstile,
} from "../_shared/turnstile.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

type RuntimeConfig = {
  supabaseUrl: string;
  secretKey: string;
  turnstileSecret: string;
  turnstileTestMode: boolean;
  expectedAction?: string;
  expectedHostname?: string;
};

const publicResponse = (
  origin: string,
  status: number,
  body: Record<string, unknown>,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

function runtimeConfig(): RuntimeConfig | undefined {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKeysJson = Deno.env.get("SUPABASE_SECRET_KEYS");
  const localSecretKey = Deno.env.get("SUPABASE_SECRET_KEY");
  const legacyServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const secretKey = resolveSupabaseSecretKey({
    secretKeysJson,
    localSecretKey,
    legacyServiceRoleKey,
  });
  const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!supabaseUrl || !secretKey || !turnstileSecret) {
    return undefined;
  }
  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ""),
    secretKey,
    turnstileSecret,
    turnstileTestMode: parseTurnstileTestMode(
      Deno.env.get("TURNSTILE_TEST_MODE"),
    ),
    expectedAction: Deno.env.get("EXPECTED_TURNSTILE_ACTION"),
    expectedHostname: Deno.env.get("EXPECTED_TURNSTILE_HOSTNAME"),
  };
}

Deno.serve(async (request) => {
  const origin = request.headers.get("Origin");
  const allowedOrigins = parseAllowedOrigins(Deno.env.get("ALLOWED_ORIGINS"));
  if (!isOriginAllowed(origin, allowedOrigins)) {
    return new Response(
      JSON.stringify({ success: false, code: "ORIGIN_NOT_ALLOWED" }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
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
    return publicResponse(safeOrigin, 405, {
      success: false,
      code: "METHOD_NOT_ALLOWED",
    });
  }

  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return publicResponse(safeOrigin, 413, {
      success: false,
      code: "REQUEST_TOO_LARGE",
    });
  }

  let input: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) {
      return publicResponse(safeOrigin, 413, {
        success: false,
        code: "REQUEST_TOO_LARGE",
      });
    }
    input = JSON.parse(raw);
  } catch {
    return publicResponse(safeOrigin, 400, {
      success: false,
      code: "INVALID_REQUEST",
    });
  }

  const parsed = validateLeadPayload(input);
  if (!parsed.success) {
    return publicResponse(safeOrigin, 400, {
      success: false,
      code: "VALIDATION_ERROR",
    });
  }

  const config = runtimeConfig();
  if (!config) {
    return publicResponse(safeOrigin, 503, {
      success: false,
      code: "SERVICE_UNAVAILABLE",
    });
  }

  try {
    const verified = await verifyTurnstile(
      parsed.data.turnstileToken,
      parsed.data.submissionId,
      {
        secret: config.turnstileSecret,
        testMode: config.turnstileTestMode,
        expectedAction: config.expectedAction,
        expectedHostname: config.expectedHostname,
      },
    );
    if (!verified) {
      return publicResponse(safeOrigin, 400, {
        success: false,
        code: "VERIFICATION_FAILED",
      });
    }

    const publicCode = await persistLead(parsed.data, config);
    if (!publicCode) {
      return publicResponse(safeOrigin, 503, {
        success: false,
        code: "SERVICE_UNAVAILABLE",
      });
    }
    return publicResponse(safeOrigin, 200, { success: true, publicCode });
  } catch {
    return publicResponse(safeOrigin, 503, {
      success: false,
      code: "SERVICE_UNAVAILABLE",
    });
  }
});
