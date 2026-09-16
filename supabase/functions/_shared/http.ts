export const MAX_REQUEST_BYTES = 64 * 1024;

export function resolveSupabaseSecretKey(input: {
  secretKeysJson?: string;
  localSecretKey?: string;
  legacyServiceRoleKey?: string;
}) {
  if (input.secretKeysJson) {
    try {
      const keys = JSON.parse(input.secretKeysJson) as Record<string, unknown>;
      if (typeof keys.default === "string" && keys.default.length > 0) {
        return keys.default;
      }
    } catch {
      // Invalid configuration is handled as an unavailable service by the caller.
    }
  }
  return input.localSecretKey || input.legacyServiceRoleKey || undefined;
}

export function parseAllowedOrigins(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(
      (origin, index, origins) =>
        /^https?:\/\/[^/]+$/i.test(origin) &&
        origin !== "*" &&
        origins.indexOf(origin) === index,
    );
}

export function isOriginAllowed(origin: string | null, allowed: string[]) {
  return Boolean(origin && allowed.includes(origin.replace(/\/$/, "")));
}

export function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "content-type, apikey",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function generatePublicCode(
  now = new Date(),
  uuid = crypto.randomUUID(),
) {
  const year = String(now.getUTCFullYear()).slice(-2);
  const suffix = uuid.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `AT-${year}-${suffix}`;
}
