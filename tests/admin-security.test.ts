import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Admin Lite security boundaries", () => {
  it("keeps backend credentials out of browser modules", () => {
    const browserSources = [
      "domain/admin/auth.ts",
      "domain/admin/client.ts",
      "components/admin/admin-auth-provider.tsx",
    ]
      .map((file) => readFileSync(join(root, file), "utf8"))
      .join("\n");
    expect(browserSources).not.toMatch(/SERVICE_ROLE|SECRET_KEYS|secretKey/);
    expect(browserSources).not.toContain("/rest/v1/mvp_leads");
    expect(browserSources).toContain("/functions/v1/admin-leads");
  });

  it("keeps the Edge Function read-only and exposes no mutation handler", () => {
    const source = readFileSync(
      join(root, "supabase/functions/_shared/admin-leads.ts"),
      "utf8",
    );
    expect(source).toContain('request.method !== "GET"');
    expect(source).not.toMatch(
      /persistLead|insertAdmin|updateAdmin|deleteAdmin/,
    );
  });

  it("has no public signup UI or sensitive logging in the admin boundary", () => {
    const files = [
      "domain/admin/auth.ts",
      "domain/admin/client.ts",
      "components/admin/admin-auth-provider.tsx",
      "supabase/functions/_shared/admin-leads.ts",
      "supabase/functions/_shared/admin-lead-repository.ts",
    ];
    const sources = files
      .map((file) => readFileSync(join(root, file), "utf8"))
      .join("\n");
    expect(sources).not.toContain("/auth/v1/signup");
    expect(sources).not.toMatch(/console\.(log|info|warn|error)/);
  });

  it("preserves RLS and revoked direct access for anon/authenticated", () => {
    const migration = readFileSync(
      join(root, "supabase/migrations/202609110001_create_leads.sql"),
      "utf8",
    );
    expect(migration).toContain(
      "alter table public.mvp_leads enable row level security",
    );
    expect(migration).toContain(
      "alter table public.mvp_leads force row level security",
    );
    expect(migration).toContain(
      "revoke all on table public.mvp_leads from anon, authenticated",
    );
    expect(migration).not.toMatch(/create policy[^;]*mvp_leads/i);
  });
});
