import { describe, expect, it, vi } from "vitest";

import {
  handleAdminLeadActions,
  parseAdminLeadAction,
  type AdminLeadActionsConfig,
} from "@/supabase/functions/_shared/admin-lead-actions";

const adminId = "10000000-0000-4000-8000-000000000001";
const config: AdminLeadActionsConfig = {
  supabaseUrl: "https://project.supabase.co",
  secretKey: "backend-secret",
  publishableKey: "publishable-key",
  adminUserIds: [adminId],
};
const origins = ["http://localhost:3000"];

function request(body: unknown, token = "jwt", method = "POST") {
  return new Request(
    "https://project.supabase.co/functions/v1/admin-lead-actions",
    {
      method,
      headers: {
        Origin: "http://localhost:3000",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: method === "POST" ? JSON.stringify(body) : undefined,
    },
  );
}

function command(action: string, extra: Record<string, unknown> = {}) {
  return { action, publicCode: "AT-26-ABC123", ...extra };
}

function authorizedFetcher(rpcStatus = 200) {
  return vi.fn<typeof fetch>((input) => {
    const url = String(input);
    if (url.endsWith("/auth/v1/user")) {
      return Promise.resolve(Response.json({ id: adminId }));
    }
    return Promise.resolve(
      Response.json(
        {
          publicCode: "AT-26-ABC123",
          status: "CONTACTED",
          statusUpdatedAt: "2026-09-17T12:00:00.000Z",
          lastContactAt: "2026-09-17T12:00:00.000Z",
          nextFollowUpAt: null,
        },
        { status: rpcStatus },
      ),
    );
  });
}

describe("admin-lead-actions Edge Function", () => {
  it("rejects missing, invalid and non-admin identities before the RPC", async () => {
    const noTokenFetcher = vi.fn<typeof fetch>();
    expect(
      (
        await handleAdminLeadActions(
          request(command("RECORD_CONTACT"), ""),
          config,
          origins,
          noTokenFetcher,
        )
      ).status,
    ).toBe(401);

    const expiredFetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ message: "JWT expired" }, { status: 401 }),
      );
    expect(
      (
        await handleAdminLeadActions(
          request(command("RECORD_CONTACT"), "expired-jwt"),
          config,
          origins,
          expiredFetcher,
        )
      ).status,
    ).toBe(401);
    expect(noTokenFetcher).not.toHaveBeenCalled();

    const invalidFetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({}, { status: 401 }));
    expect(
      (
        await handleAdminLeadActions(
          request(command("RECORD_CONTACT")),
          config,
          origins,
          invalidFetcher,
        )
      ).status,
    ).toBe(401);

    const nonAdminFetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ id: "20000000-0000-4000-8000-000000000002" }),
      );
    expect(
      (
        await handleAdminLeadActions(
          request(command("RECORD_CONTACT")),
          config,
          origins,
          nonAdminFetcher,
        )
      ).status,
    ).toBe(403);
    expect(nonAdminFetcher).toHaveBeenCalledTimes(1);

    const emptyAllowlistFetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ id: adminId }));
    expect(
      (
        await handleAdminLeadActions(
          request(command("RECORD_CONTACT")),
          { ...config, adminUserIds: [] },
          origins,
          emptyAllowlistFetcher,
        )
      ).status,
    ).toBe(403);
    expect(emptyAllowlistFetcher).toHaveBeenCalledTimes(1);
  });

  it("allows an authorized typed action and calls only the atomic RPC", async () => {
    const fetcher = authorizedFetcher();
    const response = await handleAdminLeadActions(
      request(command("CHANGE_STATUS", { status: "QUALIFIED" })),
      config,
      origins,
      fetcher,
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true });
    const rpcCall = fetcher.mock.calls[1];
    expect(String(rpcCall?.[0])).toBe(
      "https://project.supabase.co/rest/v1/rpc/apply_mvp_lead_admin_action",
    );
    expect(JSON.parse(String(rpcCall?.[1]?.body))).toMatchObject({
      p_action: "CHANGE_STATUS",
      p_status: "QUALIFIED",
      p_actor_user_id: adminId,
    });
  });

  it("validates every discriminated action and rejects arbitrary fields", () => {
    expect(parseAdminLeadAction(command("RECORD_CONTACT"))).toBeTruthy();
    expect(
      parseAdminLeadAction(command("CHANGE_STATUS", { status: "LOST" })),
    ).toBeTruthy();
    expect(
      parseAdminLeadAction(command("ADD_NOTE", { note: "Retornar amanhã" })),
    ).toBeTruthy();
    expect(
      parseAdminLeadAction(
        command("SET_FOLLOW_UP", {
          followUpAt: "2030-01-01T12:00:00.000Z",
        }),
        new Date("2026-01-01T00:00:00.000Z"),
      ),
    ).toBeTruthy();
    expect(parseAdminLeadAction(command("CLEAR_FOLLOW_UP"))).toBeTruthy();
    expect(parseAdminLeadAction(command("DELETE_LEAD"))).toBeUndefined();
    expect(
      parseAdminLeadAction(command("CHANGE_STATUS", { status: "INVALID" })),
    ).toBeUndefined();
    expect(
      parseAdminLeadAction(command("RECORD_CONTACT", { status: "CONTACTED" })),
    ).toBeUndefined();
  });

  it("rejects empty, oversized or HTML notes and past follow-ups", () => {
    expect(
      parseAdminLeadAction(command("ADD_NOTE", { note: " " })),
    ).toBeUndefined();
    expect(
      parseAdminLeadAction(command("ADD_NOTE", { note: "x".repeat(2001) })),
    ).toBeUndefined();
    expect(
      parseAdminLeadAction(command("ADD_NOTE", { note: "<b>texto</b>" })),
    ).toBeUndefined();
    expect(
      parseAdminLeadAction(
        command("SET_FOLLOW_UP", {
          followUpAt: "2020-01-01T12:00:00.000Z",
        }),
        new Date("2026-01-01T00:00:00.000Z"),
      ),
    ).toBeUndefined();
  });

  it("rejects mutation methods other than POST and preserves exact CORS", async () => {
    const fetcher = vi.fn<typeof fetch>();
    expect(
      (
        await handleAdminLeadActions(
          request({}, "", "DELETE"),
          config,
          origins,
          fetcher,
        )
      ).status,
    ).toBe(405);
    const preflight = await handleAdminLeadActions(
      request({}, "", "OPTIONS"),
      config,
      origins,
      fetcher,
    );
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("Access-Control-Allow-Methods")).toBe(
      "POST, OPTIONS",
    );
    const attacker = new Request(
      "https://project.supabase.co/functions/v1/admin-lead-actions",
      {
        method: "POST",
        headers: { Origin: "https://attacker.example" },
        body: "{}",
      },
    );
    expect(
      (await handleAdminLeadActions(attacker, config, origins, fetcher)).status,
    ).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
