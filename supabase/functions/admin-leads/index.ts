import { handleAdminLeads, parseAdminUserIds } from "../_shared/admin-leads.ts";
import {
  parseAllowedOrigins,
  resolveSupabasePublishableKey,
  resolveSupabaseSecretKey,
} from "../_shared/http.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

function runtimeConfig(allowedOrigins: readonly string[]) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
  const secretKey = resolveSupabaseSecretKey({
    secretKeysJson: Deno.env.get("SUPABASE_SECRET_KEYS"),
    localSecretKey: Deno.env.get("SUPABASE_SECRET_KEY"),
    legacyServiceRoleKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  });
  const publishableKey = resolveSupabasePublishableKey({
    publishableKeysJson: Deno.env.get("SUPABASE_PUBLISHABLE_KEYS"),
    localPublishableKey: Deno.env.get("SUPABASE_PUBLISHABLE_KEY"),
    legacyAnonKey: Deno.env.get("SUPABASE_ANON_KEY"),
  });
  const adminUserIds = parseAdminUserIds(Deno.env.get("ADMIN_USER_IDS"));
  if (!supabaseUrl || !secretKey || !publishableKey) {
    return undefined;
  }
  return {
    supabaseUrl,
    secretKey,
    publishableKey,
    adminUserIds,
    allowedOrigins,
  };
}

Deno.serve((request) => {
  const allowedOrigins = parseAllowedOrigins(Deno.env.get("ALLOWED_ORIGINS"));
  return handleAdminLeads(
    request,
    runtimeConfig(allowedOrigins),
    fetch,
    allowedOrigins,
  );
});
