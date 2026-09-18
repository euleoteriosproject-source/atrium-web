import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202609170001_m6b2_lead_operations.sql",
  ),
  "utf8",
);

const privilegeHardeningMigration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202609170002_revoke_mvp_leads_browser_privileges.sql",
  ),
  "utf8",
);

const contactedSemanticsMigration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202609170003_enforce_mvp_lead_contacted_semantics.sql",
  ),
  "utf8",
);

describe("M6B.2 additive migration", () => {
  it("adds the four operational timestamps without rewriting an applied migration", () => {
    for (const column of [
      "status_updated_at",
      "whatsapp_handoff_at",
      "last_contact_at",
      "next_follow_up_at",
    ]) {
      expect(migration).toContain(`add column if not exists ${column}`);
    }
    expect(migration).toContain("set status_updated_at = created_at");
    expect(migration).not.toMatch(/drop table public\.mvp_leads/i);
  });

  it("creates an append-only private activity table with controlled values", () => {
    expect(migration).toContain("create table public.mvp_lead_activities");
    for (const activity of [
      "LEAD_CREATED",
      "WHATSAPP_HANDOFF",
      "STATUS_CHANGED",
      "CONTACT_RECORDED",
      "NOTE_ADDED",
      "FOLLOW_UP_SET",
      "FOLLOW_UP_CLEARED",
    ]) {
      expect(migration).toContain(`'${activity}'`);
    }
    expect(migration).toContain(
      "alter table public.mvp_lead_activities enable row level security",
    );
    expect(migration).toContain(
      "alter table public.mvp_lead_activities force row level security",
    );
    expect(migration).toContain(
      "revoke all on table public.mvp_lead_activities from public, anon, authenticated",
    );
    expect(migration).toContain(
      "revoke update, delete, truncate on table public.mvp_lead_activities from service_role",
    );
    expect(migration).toContain("note = trim(note)");
    expect(migration).toContain("char_length(note) between 2 and 2000");
    expect(migration).toContain("octet_length(metadata::text) <= 2048");
    expect(migration).not.toMatch(/create policy[^;]*mvp_lead_activities/i);
  });

  it("records creation transactionally and backfills only the factual creation event", () => {
    expect(migration).toContain("after insert on public.mvp_leads");
    expect(migration).toContain("record_mvp_lead_created_activity");
    expect(migration).toContain("on conflict (lead_id)");
    expect(migration).not.toMatch(
      /set\s+whatsapp_handoff_at\s*=\s*created_at/i,
    );
    expect(migration).not.toMatch(/set\s+last_contact_at\s*=\s*created_at/i);
    expect(migration).toContain(
      "from public, anon, authenticated, service_role",
    );
    expect(migration).not.toMatch(
      /grant execute on function public\.record_mvp_lead_created_activity\(\) to service_role/i,
    );
  });

  it("keeps handoff and admin state plus activity in single SQL transactions", () => {
    expect(migration).toContain("function public.track_mvp_lead_handoff");
    expect(migration).toContain("function public.apply_mvp_lead_admin_action");
    expect(migration).toContain("for update");
    expect(migration).toContain("if v_handoff_at is null then");
    expect(migration).toContain("'WHATSAPP_HANDOFF'");
    expect(migration).toContain("'STATUS_CHANGED'");
    expect(migration).toContain("'CONTACT_RECORDED'");
    expect(migration).toContain("security invoker");
    expect(migration).toMatch(
      /revoke all on function public\.track_mvp_lead_handoff\(uuid, text\) from public, anon, authenticated;\s*grant execute on function public\.track_mvp_lead_handoff\(uuid, text\) to service_role;/i,
    );
    expect(migration).toMatch(
      /revoke all on function public\.apply_mvp_lead_admin_action\(text, text, uuid, text, text, timestamptz\)\s+from public, anon, authenticated;\s*grant execute on function public\.apply_mvp_lead_admin_action\(text, text, uuid, text, text, timestamptz\)\s+to service_role;/i,
    );
  });

  it("warns explicitly that the documented rollback destroys operational data", () => {
    expect(migration).toContain("DESTRUCTIVE ROLLBACK");
    expect(migration).toContain("Never run this block");
    expect(migration).toContain("Export/backup the data");
  });

  it("restores the no-direct-browser-access boundary with an additive migration", () => {
    expect(privilegeHardeningMigration).toContain(
      "revoke all on table public.mvp_leads from public, anon, authenticated",
    );
    expect(privilegeHardeningMigration).not.toMatch(
      /grant\s+.+\s+on\s+table\s+public\.mvp_leads/i,
    );
    expect(privilegeHardeningMigration).not.toMatch(
      /(?:insert|update|delete|truncate)\s+(?:into|from|table)?\s*public\.mvp_leads/i,
    );
  });

  it("allows NEW to become CONTACTED only with a newly recorded contact", () => {
    expect(contactedSemanticsMigration).toContain("old.status = 'NEW'");
    expect(contactedSemanticsMigration).toContain("new.status = 'CONTACTED'");
    expect(contactedSemanticsMigration).toContain(
      "new.last_contact_at is not distinct from old.last_contact_at",
    );
    expect(contactedSemanticsMigration).toContain(
      "CONTACT_REQUIRES_RECORD_CONTACT",
    );
    expect(contactedSemanticsMigration).toContain(
      "before update of status, last_contact_at on public.mvp_leads",
    );
    expect(contactedSemanticsMigration).toContain(
      "from public, anon, authenticated, service_role",
    );
  });
});
