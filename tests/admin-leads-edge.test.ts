import { describe, expect, it, vi } from "vitest";

import {
  adminAllowedOrigins,
  handleAdminLeads,
  parseAdminUserIds,
  type AdminLeadsConfig,
} from "@/supabase/functions/_shared/admin-leads";
import { buildLeadOutreachWhatsAppUrl } from "@/supabase/functions/_shared/lead-outreach-whatsapp";

const adminId = "10000000-0000-4000-8000-000000000001";
const config: AdminLeadsConfig = {
  supabaseUrl: "https://project.supabase.co",
  secretKey: "backend-secret",
  publishableKey: "sb_publishable_test",
  adminUserIds: [adminId],
  allowedOrigins: ["http://localhost:3000"],
};

function request(query = "action=list", method = "GET", token = "jwt") {
  return new Request(
    `https://project.supabase.co/functions/v1/admin-leads?${query}`,
    {
      method,
      headers: {
        Origin: "http://localhost:3000",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
}

function databaseResponse(url: string, init?: RequestInit) {
  if (url.endsWith("/auth/v1/user")) {
    return Response.json({ id: adminId });
  }
  if (init?.method === "HEAD") {
    return new Response(null, {
      status: 200,
      headers: { "Content-Range": "0-0/1" },
    });
  }
  if (url.includes("/rest/v1/mvp_lead_activities?")) {
    return Response.json([
      {
        activity_type: "NOTE_ADDED",
        created_at: "2026-09-17T12:00:00.000Z",
        from_status: null,
        to_status: null,
        note: "Retornar pela manhÃ£.",
        follow_up_at: null,
      },
      {
        activity_type: "LEAD_CREATED",
        created_at: "2026-09-16T12:00:00.000Z",
        from_status: null,
        to_status: null,
        note: null,
        follow_up_at: null,
      },
    ]);
  }
  if (url.includes("public_code=eq.AT-26-ABC123")) {
    return Response.json([
      {
        public_code: "AT-26-ABC123",
        created_at: "2026-09-16T12:00:00.000Z",
        company_name: "Empresa Exemplo",
        contact_name: "Ana Silva",
        phone: "+5511999999999",
        email: "ana@example.com",
        status: "NEW",
        status_updated_at: "2026-09-16T12:00:00.000Z",
        whatsapp_handoff_at: "2026-09-16T12:01:00.000Z",
        last_contact_at: null,
        next_follow_up_at: null,
        lead_tier: "A",
        lead_score: 91,
        timeframe: "NOW",
        primary_goal: "AUTOMATION",
        business_segment: "SERVICES",
        company_size: "TWO_TO_FIVE",
        additional_goals: ["AI"],
        answers_json: { Q004: ["WHATSAPP"], Q005: ["SPREADSHEET"] },
        top_opportunities: [
          { dimension: "automation", level: "HIGH", summary: "Resumo" },
        ],
        budget_range: "FROM_7500_TO_15000",
        source: "google",
        landing_page: "/diagnostico",
        consent_contact: true,
        consent_at: "2026-09-16T12:00:00.000Z",
        submission_id: "must-not-leak",
        id: "30000000-0000-4000-8000-000000000003",
      },
    ]);
  }
  return Response.json(
    [
      {
        public_code: "AT-26-ABC123",
        created_at: "2026-09-16T12:00:00.000Z",
        company_name: "Empresa Exemplo",
        contact_name: "Ana Silva",
        phone: "+5511999999999",
        status: "NEW",
        lead_tier: "A",
        lead_score: 91,
        timeframe: "NOW",
        primary_goal: "AUTOMATION",
        whatsapp_handoff_at: null,
        last_contact_at: null,
        next_follow_up_at: null,
      },
    ],
    { headers: { "Content-Range": "0-0/1" } },
  );
}

describe("admin-leads Edge Function", () => {
  it("parses only valid UUIDs in the private allowlist", () => {
    expect(parseAdminUserIds(`${adminId},invalid, ${adminId}`)).toEqual([
      adminId,
    ]);
  });

  it("rejects missing and invalid JWTs before database access", async () => {
    const noTokenFetch = vi.fn<typeof fetch>();
    const missing = await handleAdminLeads(
      request("action=list", "GET", ""),
      config,
      noTokenFetch,
    );
    expect(missing.status).toBe(401);
    expect(noTokenFetch).not.toHaveBeenCalled();

    const invalidFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({}, { status: 401 }));
    const invalid = await handleAdminLeads(request(), config, invalidFetch);
    expect(invalid.status).toBe(401);
    expect(invalidFetch).toHaveBeenCalledTimes(1);
    expect(invalid.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:3000",
    );
    expect(invalid.headers.get("Vary")).toBe("Origin");
  });

  it("rejects expired JWTs and a publishable key without a user session", async () => {
    const expiredFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ message: "JWT expired" }, { status: 401 }),
      );
    const expired = await handleAdminLeads(
      request("action=list", "GET", "expired-jwt"),
      config,
      expiredFetch,
    );
    expect(expired.status).toBe(401);
    expect(expiredFetch).toHaveBeenCalledTimes(1);

    const publishableOnly = new Request(
      "https://project.supabase.co/functions/v1/admin-leads?action=list",
      {
        headers: {
          Origin: "http://localhost:3000",
          apikey: "sb_publishable_test",
        },
      },
    );
    const publishableFetch = vi.fn<typeof fetch>();
    const response = await handleAdminLeads(
      publishableOnly,
      config,
      publishableFetch,
    );
    expect(response.status).toBe(401);
    expect(publishableFetch).not.toHaveBeenCalled();
  });

  it("returns 403 for an authenticated user outside the allowlist", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ id: "20000000-0000-4000-8000-000000000002" }),
      );
    const response = await handleAdminLeads(request(), config, fetcher);
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      success: false,
      code: "FORBIDDEN",
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("authorizes nobody when ADMIN_USER_IDS is empty", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ id: adminId }));
    const response = await handleAdminLeads(
      request(),
      { ...config, adminUserIds: [] },
      fetcher,
    );
    expect(response.status).toBe(403);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("returns a paginated list, summary and applies allowlisted filters", async () => {
    const fetcher = vi.fn<typeof fetch>((input, init) =>
      Promise.resolve(databaseResponse(String(input), init)),
    );
    const response = await handleAdminLeads(
      request(
        "action=list&page=2&status=NEW&tier=A&timeframe=NOW&handoff=OPENED&dateFrom=2026-09-01&dateTo=2026-09-16&query=Empresa",
      ),
      config,
      fetcher,
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items[0]).toMatchObject({
      publicCode: "AT-26-ABC123",
      companyName: "Empresa Exemplo",
    });
    expect(body.summary.total).toBe(1);
    expect(body.pagination).toMatchObject({ page: 2, pageSize: 25 });
    const listCall = fetcher.mock.calls.find(([url]) =>
      String(url).includes("order=created_at.desc"),
    );
    expect(String(listCall?.[0])).toContain("status=eq.NEW");
    expect(String(listCall?.[0])).toContain("whatsapp_handoff_at=not.is.null");
    expect(listCall?.[1]).toMatchObject({
      headers: expect.objectContaining({ Range: "25-49" }),
    });
  });

  it("returns a humanized detail without internal identifiers or raw JSON", async () => {
    const fetcher = vi.fn<typeof fetch>((input, init) =>
      Promise.resolve(databaseResponse(String(input), init)),
    );
    const response = await handleAdminLeads(
      request("action=detail&publicCode=AT-26-ABC123"),
      config,
      fetcher,
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    const serialized = JSON.stringify(body);
    expect(serialized).toContain("Reduzir trabalho manual");
    expect(serialized).toContain("Excel / Google Sheets");
    expect(serialized).not.toContain("answers_json");
    expect(serialized).not.toContain("submission_id");
    expect(serialized).not.toContain("must-not-leak");
    expect(serialized).toContain("Observação adicionada");
    expect(serialized).toContain("Retornar pela manhÃ£.");
    expect(body.lead.outreachWhatsAppUrl).toBe(
      buildLeadOutreachWhatsAppUrl({
        contactName: "Ana Silva",
        phone: "+5511999999999",
        primaryGoal: "AUTOMATION",
        timeframe: "NOW",
        topOpportunities: [{ dimension: "automation" }],
      }),
    );
    expect(
      body.lead.activities.map((item: { type: string }) => item.type),
    ).toEqual(["NOTE_ADDED", "LEAD_CREATED"]);
    expect(serialized).not.toContain("actor_user_id");
    expect(serialized).not.toContain("metadata");
  });

  it("returns 404 for a missing lead and rejects invalid filters", async () => {
    const missingFetcher = vi.fn<typeof fetch>((input) => {
      if (String(input).endsWith("/auth/v1/user")) {
        return Promise.resolve(Response.json({ id: adminId }));
      }
      return Promise.resolve(Response.json([]));
    });
    const missing = await handleAdminLeads(
      request("action=detail&publicCode=AT-26-ZZZ999"),
      config,
      missingFetcher,
    );
    expect(missing.status).toBe(404);

    const invalid = await handleAdminLeads(
      request("action=list&status=INVALID"),
      config,
      missingFetcher,
    );
    expect(invalid.status).toBe(400);
  });

  it("rejects PostgREST filter injection and invalid page/date/publicCode values", async () => {
    const fetcher = vi.fn<typeof fetch>((input) => {
      if (String(input).endsWith("/auth/v1/user")) {
        return Promise.resolve(Response.json({ id: adminId }));
      }
      throw new Error("repository must not be reached");
    });
    const invalidQueries = [
      "action=list&query=Empresa%29%2Cor%3D%28status.eq.NEW",
      "action=list&page=10001",
      "action=list&page=1.5",
      "action=list&dateFrom=2026-02-30",
      "action=detail&publicCode=AT-26-ABC123%29.or.%28status.eq.NEW",
    ];
    for (const query of invalidQueries) {
      const response = await handleAdminLeads(request(query), config, fetcher);
      expect(response.status).toBe(400);
    }
    expect(fetcher).toHaveBeenCalledTimes(invalidQueries.length);
  });

  it("keeps page size fixed at 25 even when the caller requests more", async () => {
    const fetcher = vi.fn<typeof fetch>((input, init) =>
      Promise.resolve(databaseResponse(String(input), init)),
    );
    const response = await handleAdminLeads(
      request("action=list&page=1&pageSize=1000000"),
      config,
      fetcher,
    );
    expect(response.status).toBe(200);
    const listCall = fetcher.mock.calls.find(([url]) =>
      String(url).includes("order=created_at.desc"),
    );
    expect(listCall?.[1]).toMatchObject({
      headers: expect.objectContaining({ Range: "0-24" }),
    });
    expect(await response.json()).toMatchObject({
      pagination: { pageSize: 25 },
    });
  });

  it("supports CORS preflight and never accepts mutation methods", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const preflight = await handleAdminLeads(
      request("", "OPTIONS", ""),
      config,
      fetcher,
    );
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("Access-Control-Allow-Methods")).toBe(
      "GET, OPTIONS",
    );
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      const response = await handleAdminLeads(
        request("", method),
        config,
        fetcher,
      );
      expect(response.status).toBe(405);
    }
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("uses an exact CORS allowlist and rejects wildcard or lookalike origins", async () => {
    expect(adminAllowedOrigins("*, https://admin.example.com/")).toEqual([
      "https://admin.example.com",
    ]);
    const fetcher = vi.fn<typeof fetch>();
    const lookalike = new Request(
      "https://project.supabase.co/functions/v1/admin-leads?action=list",
      {
        headers: {
          Origin: "http://localhost:3000.attacker.example",
          Authorization: "Bearer jwt",
        },
      },
    );
    const response = await handleAdminLeads(lookalike, config, fetcher);
    expect(response.status).toBe(403);
    expect(response.headers.has("Access-Control-Allow-Origin")).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("preserves CORS on sanitized service-unavailable responses", async () => {
    const auditedHandle = handleAdminLeads as unknown as (
      request: Request,
      config: AdminLeadsConfig | undefined,
      fetcher: typeof fetch,
      allowedOrigins: readonly string[],
    ) => Promise<Response>;
    const response = await auditedHandle(
      request("action=list", "GET", "jwt"),
      undefined,
      vi.fn<typeof fetch>(),
      ["http://localhost:3000"],
    );
    expect(response.status).toBe(503);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:3000",
    );
    expect(response.headers.get("Vary")).toBe("Origin");
  });
});
