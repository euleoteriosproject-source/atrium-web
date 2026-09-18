import { describe, expect, it, vi } from "vitest";

import { createDiagnosticState } from "@/domain/diagnostic/types";
import {
  createLead,
  LeadSubmissionError,
  trackLeadHandoff,
} from "@/domain/lead/client";
import { leadSubmissionSchema } from "@/domain/lead/schema";

function submission() {
  return leadSubmissionSchema.parse({
    submissionId: "123e4567-e89b-42d3-a456-426614174000",
    contact: {
      contactName: "Ana Silva",
      companyName: "Empresa Exemplo",
      phone: "+5511999999999",
      email: null,
      timeframe: null,
      budgetRange: null,
      consentContact: true,
    },
    diagnostic: {
      ...createDiagnosticState(new Date("2026-09-11T00:00:00.000Z")),
      primaryGoal: "DISCOVERY",
      stage: "complete",
    },
    turnstileToken: "token",
    website: "",
  });
}

describe("lead API client", () => {
  it("calls the Edge Function with a publishable key and accepts only the minimal response", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ success: true, publicCode: "AT-26-ABC123" }),
      );
    await expect(
      createLead(
        submission(),
        {
          supabaseUrl: "https://project.supabase.co/",
          publishableKey: "sb_publishable_test",
        },
        fetchMock,
      ),
    ).resolves.toEqual({ success: true, publicCode: "AT-26-ABC123" });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://project.supabase.co/functions/v1/create-lead",
    );
    const headers = new Headers(
      (fetchMock.mock.calls[0]?.[1] as RequestInit | undefined)?.headers,
    );
    expect(headers.get("apikey")).toBe("sb_publishable_test");
    expect(headers.has("Authorization")).toBe(false);
  });

  it("maps network and malformed-response failures to a generic public error", async () => {
    const networkFailure = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("private network detail"));
    await expect(
      createLead(
        submission(),
        { supabaseUrl: "https://project.supabase.co" },
        networkFailure,
      ),
    ).rejects.toEqual(new LeadSubmissionError());

    const malformedResponse = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        success: true,
        publicCode: "AT-26-ABC123",
        leadScore: 99,
      }),
    );
    await expect(
      createLead(
        submission(),
        { supabaseUrl: "https://project.supabase.co" },
        malformedResponse,
      ),
    ).rejects.toBeInstanceOf(LeadSubmissionError);
  });

  it("tracks handoff with keepalive and degrades to false", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ success: true }));
    await expect(
      trackLeadHandoff(
        {
          submissionId: "123e4567-e89b-42d3-a456-426614174000",
          publicCode: "AT-26-ABC123",
        },
        {
          supabaseUrl: "https://project.supabase.co/",
          publishableKey: "publishable-key",
        },
        fetcher,
      ),
    ).resolves.toBe(true);
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({
      method: "POST",
      keepalive: true,
    });
    expect(new Headers(fetcher.mock.calls[0]?.[1]?.headers).get("apikey")).toBe(
      "publishable-key",
    );

    await expect(
      trackLeadHandoff(
        {
          submissionId: "123e4567-e89b-42d3-a456-426614174000",
          publicCode: "AT-26-ABC123",
        },
        { supabaseUrl: "https://project.supabase.co" },
        vi.fn<typeof fetch>().mockRejectedValue(new Error("offline")),
      ),
    ).resolves.toBe(false);
  });
});
