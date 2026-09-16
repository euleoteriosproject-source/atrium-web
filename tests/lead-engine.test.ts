import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { calculateOpportunityScores as calculateFrontendScores } from "@/domain/diagnostic/scoring";
import {
  createDiagnosticState,
  type DiagnosticState,
} from "@/domain/diagnostic/types";
import {
  buildLeadRecord,
  calculateLeadScore,
  calculateOpportunityScores,
  leadTierFor,
  validateLeadPayload,
  type DiagnosticPayload,
} from "@/supabase/functions/_shared/lead-engine";
import {
  corsHeaders,
  generatePublicCode,
  isOriginAllowed,
  parseAllowedOrigins,
  resolveSupabaseSecretKey,
} from "@/supabase/functions/_shared/http";
import { persistLead } from "@/supabase/functions/_shared/lead-repository";
import {
  parseTurnstileTestMode,
  verifyTurnstile,
} from "@/supabase/functions/_shared/turnstile";

function diagnostic(
  overrides: Partial<DiagnosticPayload> = {},
): DiagnosticPayload {
  return {
    version: "1.0.0",
    startedAt: "2026-09-11T00:00:00.000Z",
    primaryGoal: "AUTOMATION",
    additionalGoals: [],
    segment: "SERVICES",
    companySize: "TWO_TO_FIVE",
    acquisitionChannels: ["WHATSAPP"],
    tools: ["WHATSAPP", "SPREADSHEET"],
    answers: {
      Q001: ["AUTOMATION"],
      Q002: "SERVICES",
      Q003: "TWO_TO_FIVE",
      Q004: ["WHATSAPP"],
      Q005: ["WHATSAPP", "SPREADSHEET"],
      A001: "COPY_REGISTER",
      A002: "DAILY",
      A003: "TWO_TO_THREE",
      A004: "THIRTY_TO_SIXTY",
      A005: "FREQUENTLY",
      A006: "PARTLY",
      A007: "FREQUENTLY",
    },
    calculator: { estimatedMonthlyHours: 40.6 },
    stage: "complete",
    ...overrides,
  };
}

function payload() {
  return {
    submissionId: "123e4567-e89b-42d3-a456-426614174000",
    contact: {
      contactName: "Ana Silva",
      companyName: "Empresa Exemplo",
      phone: "+55 (11) 99999-9999",
      email: null,
      timeframe: "NOW",
      budgetRange: "FROM_15000_TO_30000",
      consentContact: true,
    },
    diagnostic: {
      ...diagnostic(),
      opportunityScores: {
        digital: 999,
        sales: 999,
        service: 999,
        automation: 999,
        integration: 999,
        software: 999,
        ai: 999,
      },
      aiRiskScore: 999,
    },
    attribution: { utmSource: "google", landingPage: "/" },
    turnstileToken: "test-token",
    website: "",
  };
}

describe("Edge lead engine", () => {
  it("validates and normalizes a public payload", () => {
    const parsed = validateLeadPayload(payload());
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.contact.phone).toBe("+5511999999999");
      expect(parsed.data.diagnostic).not.toHaveProperty("opportunityScores");
    }
  });

  it("rejects malformed, non-consented and honeypot payloads", () => {
    expect(validateLeadPayload({}).success).toBe(false);
    expect(
      validateLeadPayload({
        ...payload(),
        contact: { ...payload().contact, consentContact: false },
      }).success,
    ).toBe(false);
    expect(
      validateLeadPayload({ ...payload(), website: "filled" }).success,
    ).toBe(false);
  });

  it("recalculates M3 opportunity scores consistently on the backend", () => {
    const state = diagnostic();
    const frontendState: DiagnosticState = {
      ...createDiagnosticState(new Date(state.startedAt)),
      ...state,
      version: "1.0.0",
      opportunityScores: createDiagnosticState().opportunityScores,
      aiRiskScore: 0,
    };
    expect(calculateOpportunityScores(state)).toEqual(
      calculateFrontendScores(frontendState),
    );
  });

  it("does not persist client-provided lead or opportunity scores", () => {
    const parsed = validateLeadPayload({
      ...payload(),
      leadScore: 100,
      leadTier: "A",
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const record = buildLeadRecord(parsed.data, "AT-26-ABC123");
    expect(record.opportunity_scores.automation).not.toBe(999);
    expect(record.lead_score).toBeLessThanOrEqual(100);
    expect(record).not.toHaveProperty("turnstile_token");
  });

  it("keeps score inside 0–100 and maps all tiers", () => {
    const strong = calculateLeadScore(
      diagnostic({ companySize: "SIX_TO_TWENTY" }),
      "NOW",
      "FROM_15000_TO_30000",
    );
    const weak = calculateLeadScore(
      diagnostic({
        primaryGoal: "DISCOVERY",
        companySize: "ONE",
        answers: { Q001: ["DISCOVERY"], Q003: "ONE" },
        calculator: undefined,
      }),
      "EXPLORING",
      "UP_TO_3000",
    );
    expect(strong.total).toBeGreaterThan(weak.total);
    expect(strong.breakdown.fit).toBeGreaterThan(weak.breakdown.fit);
    expect(strong.total).toBeLessThanOrEqual(100);
    expect(weak.total).toBeGreaterThanOrEqual(0);
    expect(leadTierFor(75)).toBe("A");
    expect(leadTierFor(55)).toBe("B");
    expect(leadTierFor(35)).toBe("C");
    expect(leadTierFor(34)).toBe("D");
  });

  it("does not use business segment as a fit penalty", () => {
    const first = calculateLeadScore(
      diagnostic({ segment: "SERVICES" }),
      null,
      null,
    );
    const second = calculateLeadScore(
      diagnostic({ segment: "OTHER_VALID_SEGMENT" }),
      null,
      null,
    );
    expect(first.breakdown.fit).toBe(second.breakdown.fit);
  });

  it("treats unknown budget as neutral and urgency as incremental", () => {
    const state = diagnostic();
    const noBudget = calculateLeadScore(state, "EXPLORING", null);
    const understanding = calculateLeadScore(
      state,
      "EXPLORING",
      "UNDERSTANDING",
    );
    const urgent = calculateLeadScore(state, "NOW", null);
    expect(noBudget.breakdown.budget).toBe(5);
    expect(understanding.breakdown.budget).toBe(5);
    expect(urgent.breakdown.urgency).toBeGreaterThan(
      noBudget.breakdown.urgency,
    );
  });

  it("uses an exact CORS allowlist without wildcards", () => {
    const allowed = parseAllowedOrigins(
      "https://atrium.example,http://localhost:3000,*",
    );
    expect(allowed).toEqual([
      "https://atrium.example",
      "http://localhost:3000",
    ]);
    expect(isOriginAllowed("https://atrium.example", allowed)).toBe(true);
    expect(isOriginAllowed("https://evil.example", allowed)).toBe(false);
    expect(corsHeaders("http://localhost:3000")).toMatchObject({
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Headers": "content-type, apikey",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      Vary: "Origin",
    });
  });

  it("prefers the current Supabase secret-key map with safe fallbacks", () => {
    expect(
      resolveSupabaseSecretKey({
        secretKeysJson: JSON.stringify({ default: "sb_secret_current" }),
        localSecretKey: "sb_secret_local",
        legacyServiceRoleKey: "legacy-key",
      }),
    ).toBe("sb_secret_current");
    expect(
      resolveSupabaseSecretKey({
        secretKeysJson: "invalid-json",
        localSecretKey: "sb_secret_local",
      }),
    ).toBe("sb_secret_local");
    expect(resolveSupabaseSecretKey({})).toBeUndefined();
  });

  it("returns an existing lead without inserting a duplicate", async () => {
    const parsed = validateLeadPayload(payload());
    if (!parsed.success) throw new Error("invalid test payload");
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json([{ public_code: "AT-26-ABC123" }]));
    const code = await persistLead(
      parsed.data,
      {
        supabaseUrl: "https://project.supabase.co",
        secretKey: "sb_secret_test",
      },
      fetchMock,
    );
    expect(code).toBe("AT-26-ABC123");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "/rest/v1/mvp_leads?",
    );
    const headers = new Headers(
      (fetchMock.mock.calls[0]?.[1] as RequestInit | undefined)?.headers,
    );
    expect(headers.get("apikey")).toBe("sb_secret_test");
    expect(headers.has("Authorization")).toBe(false);
  });

  it("resolves a concurrent idempotency conflict to the existing code", async () => {
    const parsed = validateLeadPayload(payload());
    if (!parsed.success) throw new Error("invalid test payload");
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json([]))
      .mockResolvedValueOnce(new Response(null, { status: 409 }))
      .mockResolvedValueOnce(Response.json([{ public_code: "AT-26-ABC123" }]));
    const code = await persistLead(
      parsed.data,
      {
        supabaseUrl: "https://project.supabase.co",
        secretKey: "sb_secret_test",
      },
      fetchMock,
    );
    expect(code).toBe("AT-26-ABC123");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[1]?.[0])).toMatch(
      /\/rest\/v1\/mvp_leads$/,
    );
  });

  it("accepts successful dummy verification only in explicit test mode", async () => {
    const testModeFetch = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        success: true,
        action: null,
        hostname: "example.com",
        "error-codes": [],
      }),
    );
    await expect(
      verifyTurnstile(
        "token",
        "123e4567-e89b-42d3-a456-426614174000",
        {
          secret: "secret",
          testMode: true,
          expectedAction: "test",
          expectedHostname: "localhost",
        },
        testModeFetch,
      ),
    ).resolves.toBe(true);
    expect(testModeFetch).toHaveBeenCalledTimes(1);
    const request = testModeFetch.mock.calls[0]?.[1] as RequestInit;
    expect(String(request.body)).toContain("response=token");
  });

  it("rejects unsuccessful Siteverify responses even in test mode", async () => {
    const rejectedFetch = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        success: false,
        action: null,
        hostname: "example.com",
      }),
    );

    await expect(
      verifyTurnstile(
        "token",
        "123e4567-e89b-42d3-a456-426614174000",
        { secret: "secret", testMode: true },
        rejectedFetch,
      ),
    ).resolves.toBe(false);
  });

  it("keeps strict action and hostname validation outside test mode", async () => {
    const validFetch = vi.fn<typeof fetch>().mockImplementation(() =>
      Promise.resolve(
        Response.json({
          success: true,
          action: "create_lead",
          hostname: "atrium.example",
        }),
      ),
    );

    await expect(
      verifyTurnstile(
        "token",
        "123e4567-e89b-42d3-a456-426614174000",
        {
          secret: "secret",
          expectedAction: "create_lead",
          expectedHostname: "atrium.example",
        },
        validFetch,
      ),
    ).resolves.toBe(true);

    const wrongActionFetch = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        success: true,
        action: "test",
        hostname: "atrium.example",
      }),
    );
    await expect(
      verifyTurnstile(
        "token",
        "123e4567-e89b-42d3-a456-426614174000",
        {
          secret: "secret",
          expectedAction: "create_lead",
          expectedHostname: "atrium.example",
        },
        wrongActionFetch,
      ),
    ).resolves.toBe(false);

    const wrongHostnameFetch = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        success: true,
        action: "create_lead",
        hostname: "example.com",
      }),
    );
    await expect(
      verifyTurnstile(
        "token",
        "123e4567-e89b-42d3-a456-426614174000",
        {
          secret: "secret",
          expectedAction: "create_lead",
          expectedHostname: "atrium.example",
        },
        wrongHostnameFetch,
      ),
    ).resolves.toBe(false);
  });

  it("enables test mode only for normalized lowercase true", () => {
    expect(parseTurnstileTestMode("true")).toBe(true);
    expect(parseTurnstileTestMode("  true  ")).toBe(true);
    expect(parseTurnstileTestMode()).toBe(false);
    expect(parseTurnstileTestMode("")).toBe(false);
    expect(parseTurnstileTestMode("   ")).toBe(false);
    expect(parseTurnstileTestMode("TRUE")).toBe(false);
    expect(parseTurnstileTestMode("1")).toBe(false);
    expect(parseTurnstileTestMode("yes")).toBe(false);
    expect(parseTurnstileTestMode("false")).toBe(false);
  });

  it("uses strict production validation when test mode is absent", async () => {
    const validFetch = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        success: true,
        action: "create_lead",
        hostname: "atrium.example",
      }),
    );
    await expect(
      verifyTurnstile(
        "token",
        "123e4567-e89b-42d3-a456-426614174000",
        { secret: "secret", expectedHostname: "atrium.example" },
        validFetch,
      ),
    ).resolves.toBe(true);
  });

  it("generates a short non-sequential server code", () => {
    expect(
      generatePublicCode(
        new Date("2026-09-11T00:00:00.000Z"),
        "abcdef12-3456-4789-abcd-ef1234567890",
      ),
    ).toBe("AT-26-ABCDEF");
  });

  it("creates only the isolated MVP lead table with required constraints", () => {
    const migration = readFileSync(
      resolve("supabase/migrations/202609110001_create_leads.sql"),
      "utf8",
    );

    expect(migration.match(/\bcreate table\b/gi)).toHaveLength(1);
    expect(migration).toMatch(/create table public\.mvp_leads\s*\(/i);
    expect(migration).not.toMatch(/public\.leads\b/i);
    expect(migration).toMatch(
      /id uuid primary key default extensions\.gen_random_uuid\(\)/i,
    );
    expect(migration).toMatch(/submission_id uuid not null unique/i);
    expect(migration).toMatch(/public_code text not null unique/i);
    expect(migration).toMatch(/contact_name text not null/i);
    expect(migration).toMatch(/company_name text not null/i);
    expect(migration).toMatch(/phone text not null/i);
    expect(migration).toMatch(/email text,/i);
    expect(migration).toMatch(/answers_json jsonb not null/i);
    expect(migration).toMatch(/lead_score integer not null/i);
    expect(migration).toMatch(/lead_score between 0 and 100/i);
    expect(migration).toMatch(/lead_tier in \('A', 'B', 'C', 'D'\)/i);
    expect(migration).toMatch(
      /status in \('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'\)/i,
    );
    expect(migration).toMatch(
      /consent_contact boolean not null check \(consent_contact\)/i,
    );
    expect(migration).toMatch(/consent_at timestamptz not null/i);
  });

  it("enforces RLS without public CRUD access and keeps Edge access", () => {
    const migration = readFileSync(
      resolve("supabase/migrations/202609110001_create_leads.sql"),
      "utf8",
    );

    expect(migration).toMatch(
      /alter table public\.mvp_leads enable row level security/i,
    );
    expect(migration).toMatch(
      /alter table public\.mvp_leads force row level security/i,
    );
    expect(migration).toMatch(
      /revoke all on table public\.mvp_leads from anon, authenticated/i,
    );
    expect(migration).toMatch(
      /grant all on table public\.mvp_leads to service_role/i,
    );
    expect(migration).not.toMatch(/create policy/i);
    expect(migration).not.toMatch(
      /grant\s+(?:select|insert|update|delete|all)[^;]*\bto\s+(?:anon|authenticated)\b/i,
    );
  });

  it("defines only the three operational secondary indexes", () => {
    const migration = readFileSync(
      resolve("supabase/migrations/202609110001_create_leads.sql"),
      "utf8",
    );

    expect(migration.match(/\bcreate index\b/gi)).toHaveLength(3);
    expect(migration).toMatch(
      /create index mvp_leads_created_at_idx on public\.mvp_leads \(created_at desc\)/i,
    );
    expect(migration).toMatch(
      /create index mvp_leads_status_idx on public\.mvp_leads \(status\)/i,
    );
    expect(migration).toMatch(
      /create index mvp_leads_tier_idx on public\.mvp_leads \(lead_tier\)/i,
    );
  });
});
