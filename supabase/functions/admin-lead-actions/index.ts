import { handleAdminLeadActions } from "../_shared/admin-lead-actions.ts";
import { parseAdminUserIds } from "../_shared/admin-leads.ts";
import {
  parseAllowedOrigins,
  resolveSupabasePublishableKey,
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
  const publishableKey = resolveSupabasePublishableKey({
    publishableKeysJson: Deno.env.get("SUPABASE_PUBLISHABLE_KEYS"),
    localPublishableKey: Deno.env.get("SUPABASE_PUBLISHABLE_KEY"),
    legacyAnonKey: Deno.env.get("SUPABASE_ANON_KEY"),
  });
  if (!supabaseUrl || !secretKey || !publishableKey) return;
  return {
    supabaseUrl,
    secretKey,
    publishableKey,
    adminUserIds: parseAdminUserIds(Deno.env.get("ADMIN_USER_IDS")),
  };
}

Deno.serve((request) =>
  handleAdminLeadActions(
    request,
    runtimeConfig(),
    parseAllowedOrigins(Deno.env.get("ALLOWED_ORIGINS")),
  ),
);
