import { describe, expect, it, vi } from "vitest";

import {
  createHandoffRateLimiter,
  handleLeadHandoff,
} from "@/supabase/functions/_shared/lead-handoff";

const config = {
  supabaseUrl: "https://project.supabase.co",
  secretKey: "backend-secret",
};
const allowedOrigins = ["http://localhost:3000"];
const payload = {
  submissionId: "123e4567-e89b-42d3-a456-426614174000",
  publicCode: "AT-26-ABC123",
};

function request(body: unknown = payload, method = "POST") {
  return new Request(
    "https://project.supabase.co/functions/v1/track-lead-handoff",
    {
      method,
      headers: {
        Origin: "http://localhost:3000",
        "Content-Type": "application/json",
      },
      body: method === "POST" ? JSON.stringify(body) : undefined,
    },
  );
}

describe("track-lead-handoff Edge Function", () => {
  it("records a valid identifier pair through the atomic RPC", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(() => Promise.resolve(Response.json(true)));
    const response = await handleLeadHandoff(
      request(),
      config,
      allowedOrigins,
      fetcher,
      createHandoffRateLimiter(),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      "https://project.supabase.co/rest/v1/rpc/track_mvp_lead_handoff",
    );
    const body = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(body).toEqual({
      p_submission_id: payload.submissionId,
      p_public_code: payload.publicCode,
    });
  });

  it("returns the same minimal success on repeat calls and delegates idempotency to SQL", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(() => Promise.resolve(Response.json(true)));
    const limiter = createHandoffRateLimiter();
    for (let index = 0; index < 2; index += 1) {
      const response = await handleLeadHandoff(
        request(),
        config,
        allowedOrigins,
        fetcher,
        limiter,
      );
      expect(await response.json()).toEqual({ success: true });
    }
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("rejects arbitrary fields and hides whether a valid identifier pair exists", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(false));
    const invalid = await handleLeadHandoff(
      request({ ...payload, status: "CONTACTED" }),
      config,
      allowedOrigins,
      fetcher,
      createHandoffRateLimiter(),
    );
    expect(invalid.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();

    const mismatch = await handleLeadHandoff(
      request(),
      config,
      allowedOrigins,
      fetcher,
      createHandoffRateLimiter(),
    );
    expect(mismatch.status).toBe(200);
    expect(await mismatch.json()).toEqual({ success: true });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("enforces exact CORS, method, payload and rate limits", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const wrongOrigin = new Request(
      "https://project.supabase.co/functions/v1/track-lead-handoff",
      {
        method: "POST",
        headers: { Origin: "https://attacker.example" },
        body: JSON.stringify(payload),
      },
    );
    expect(
      (await handleLeadHandoff(wrongOrigin, config, allowedOrigins, fetcher))
        .status,
    ).toBe(403);
    expect(
      (
        await handleLeadHandoff(
          request(undefined, "GET"),
          config,
          allowedOrigins,
          fetcher,
        )
      ).status,
    ).toBe(405);

    const limiter = createHandoffRateLimiter(1);
    const successfulFetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(true));
    await handleLeadHandoff(
      request(),
      config,
      allowedOrigins,
      successfulFetcher,
      limiter,
    );
    const limited = await handleLeadHandoff(
      request(),
      config,
      allowedOrigins,
      successfulFetcher,
      limiter,
    );
    expect(limited.status).toBe(429);
  });
});
