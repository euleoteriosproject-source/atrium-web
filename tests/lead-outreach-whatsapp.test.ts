import { describe, expect, it } from "vitest";

import {
  buildLeadOutreachWhatsAppMessage,
  buildLeadOutreachWhatsAppUrl,
} from "@/supabase/functions/_shared/lead-outreach-whatsapp";

const input = {
  contactName: "Ana Maria",
  phone: "5551982895068",
  primaryGoal: "AUTOMATION",
  timeframe: "ONE_TO_THREE_MONTHS",
  topOpportunities: [{ dimension: "automation" }],
};

describe("Atrium-to-customer WhatsApp builder", () => {
  it("builds a short humanized and encoded outreach message", () => {
    const message = buildLeadOutreachWhatsAppMessage(input);
    expect(message).toContain("Olá, Ana! Aqui é o Vinicius, da Atrium.");
    expect(message).toContain("reduzir trabalho manual");
    expect(message).toContain("reduzir trabalho manual com automação");
    expect(message).toContain("próximos 1–3 meses");
    const url = new URL(buildLeadOutreachWhatsAppUrl(input) as string);
    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/5551982895068");
    expect(url.searchParams.get("text")).toBe(message);
  });

  it("uses safe fallbacks when context is absent", () => {
    const message = buildLeadOutreachWhatsAppMessage({
      contactName: null,
      phone: "5551982895068",
      topOpportunities: [],
    });
    expect(message).toContain("Olá! Aqui é o Vinicius, da Atrium.");
    expect(message).toContain("compartilhou um pouco do cenário");
    expect(message).not.toContain("undefined");
  });

  it("never exposes internal qualification or raw diagnostic data", () => {
    const message = buildLeadOutreachWhatsAppMessage(input);
    expect(message).not.toMatch(/score|tier|status|budget|orçamento|tracking/i);
    expect(message).not.toMatch(/answers_json|AUTOMATION|ONE_TO_THREE_MONTHS/);
  });

  it("rejects a non-canonicalizable phone", () => {
    expect(
      buildLeadOutreachWhatsAppUrl({ ...input, phone: "invalid" }),
    ).toBeUndefined();
  });
});
