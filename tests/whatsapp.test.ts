import { describe, expect, it } from "vitest";

import { createDiagnosticState } from "@/domain/diagnostic/types";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/domain/lead/whatsapp";

const diagnostic = {
  ...createDiagnosticState(new Date("2026-01-01T00:00:00.000Z")),
  primaryGoal: "AUTOMATION" as const,
  additionalGoals: ["INTEGRATION" as const],
  segment: "SERVICES",
  companySize: "SIX_TO_TWENTY",
  answers: {
    Q001: ["AUTOMATION", "INTEGRATION"],
    Q002: "SERVICES",
    Q003: "SIX_TO_TWENTY",
    Q005: ["WHATSAPP", "SPREADSHEET", "CRM"],
    A001: "COPY_REGISTER",
    A002: "DAILY",
    A003: "FOUR_TO_SIX",
    A004: "THIRTY_TO_SIXTY",
    A005: "FREQUENTLY",
    A006: "PARTLY",
    A007: "FREQUENTLY",
  },
  stage: "complete" as const,
};

describe("WhatsApp handoff builder", () => {
  it("builds a friendly encoded message with public code", () => {
    const input = {
      diagnostic,
      companyName: "Empresa & Filhos",
      timeframe: "ONE_TO_THREE_MONTHS" as const,
      publicCode: "AT-26-ABC123",
    };
    const url = new URL(buildWhatsAppUrl("+55 (11) 99999-9999", input));
    const message = url.searchParams.get("text") ?? "";
    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/5511999999999");
    expect(message).toContain("Diagnóstico: AT-26-ABC123");
    expect(message).toContain("Empresa: Empresa & Filhos");
    expect(message).toContain("Nos próximos 1–3 meses");
  });

  it("uses at most three opportunities and omits internal data", () => {
    const message = buildWhatsAppMessage({
      diagnostic,
      companyName: "Empresa Exemplo",
      timeframe: null,
      publicCode: null,
    });
    const opportunities = message
      .split("\n")
      .filter((line) => /^[1-3]\. /.test(line));
    expect(opportunities.length).toBeLessThanOrEqual(3);
    expect(message).toContain("Diagnóstico: não registrado");
    expect(message).not.toMatch(/lead.?score|tier|answers_json|budget|999/i);
  });

  it("includes only a concise set of evidence", () => {
    const message = buildWhatsAppMessage({
      diagnostic,
      companyName: "Empresa Exemplo",
      timeframe: null,
      publicCode: null,
    });
    const bullets = message.split("\n").filter((line) => line.startsWith("- "));
    expect(bullets.length).toBeGreaterThanOrEqual(3);
    expect(bullets.length).toBeLessThanOrEqual(5);
  });
});
