import { handleLeadHandoff } from "../_shared/lead-handoff.ts";
import {
  parseAllowedOrigins,
  resolveSupabaseSecretKey,
} from "../_shared/http.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

function runtimeConfig() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
  const secretKey = resolveSupabaseSecretKey({
    secretKeysJson: Deno.env.get("SUPABASE_SECRET_KEYS"),
    localSecretKey: Deno.env.get("SUPABASE_SECRET_KEY"),
    legacyServiceRoleKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  });
  return supabaseUrl && secretKey ? { supabaseUrl, secretKey } : undefined;
}

Deno.serve((request) =>
  handleLeadHandoff(
    request,
    runtimeConfig(),
    parseAllowedOrigins(Deno.env.get("ALLOWED_ORIGINS")),
  ),
);
