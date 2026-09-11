import { describe, expect, it } from "vitest";

import { insightLibrary } from "@/domain/diagnostic/insights";
import {
  buildDiagnosticResult,
  getOpportunityLevel,
} from "@/domain/diagnostic/results";
import {
  createDiagnosticState,
  type DiagnosticAnswer,
  type DiagnosticState,
  type Goal,
  type OpportunityDimension,
} from "@/domain/diagnostic/types";

function completedScenario(
  goal: Goal,
  answers: Record<string, DiagnosticAnswer>,
): DiagnosticState {
  return {
    ...createDiagnosticState(new Date("2026-01-01T00:00:00.000Z")),
    primaryGoal: goal,
    answers: { Q001: [goal], ...answers },
    stage: "complete",
  };
}

const scenarios: Record<OpportunityDimension, DiagnosticState> = {
  automation: completedScenario("AUTOMATION", {
    A001: "UPDATE_SPREADSHEETS",
    A002: "DAILY",
    A003: "TWO_TO_THREE",
    A004: "THIRTY_TO_SIXTY",
    A005: "SOMETIMES",
    A007: "FREQUENTLY",
  }),
  integration: completedScenario("INTEGRATION", {
    I001: ["CRM", "ERP"],
    I002: "FREQUENTLY",
    I004: "DAILY",
  }),
  sales: completedScenario("SALES", {
    S001: "WHATSAPP",
    S002: "OVER_DAY",
    S003: "NO",
    S004: "ALMOST_NONE",
  }),
  service: completedScenario("SERVICE", {
    C001: ["WHATSAPP", "EMAIL", "PHONE"],
    C002: "MANY",
    C003: "ALMOST_ALWAYS",
  }),
  digital: completedScenario("WEBSITE", {
    W001: "NO",
    W003: ["CONTACTS", "QUALIFY"],
  }),
  software: completedScenario("SOFTWARE", {
    SW001: "FULLY_MANUAL",
    SW004: "CLEAR",
  }),
  ai: completedScenario("AI", {
    AI001: ["ANALYZE_DOCUMENTS"],
    AI002: "HIGH",
    AI003: "YES",
    AI004: "LOW",
    AI005: "YES",
  }),
};

describe("diagnostic result rules", () => {
  it("centralizes the public opportunity levels", () => {
    expect(getOpportunityLevel(7)).toBe("HIGH");
    expect(getOpportunityLevel(6.99)).toBe("MODERATE");
    expect(getOpportunityLevel(4)).toBe("MODERATE");
    expect(getOpportunityLevel(3.99)).toBe("LOW");
  });

  it("keeps the insight library deterministic and covers every dimension", () => {
    const covered = new Set(insightLibrary.map(({ dimension }) => dimension));
    expect(covered).toEqual(
      new Set([
        "digital",
        "sales",
        "service",
        "automation",
        "integration",
        "software",
        "ai",
      ]),
    );
  });

  it.each(Object.entries(scenarios))(
    "creates an evidence-backed insight for %s",
    (dimension, state) => {
      const result = buildDiagnosticResult(state);
      const opportunity = result.opportunities.find(
        (item) => item.dimension === dimension,
      );
      expect(opportunity).toBeDefined();
      expect(opportunity?.evidence.length).toBeGreaterThanOrEqual(2);
      expect(opportunity?.evidence.length).toBeLessThanOrEqual(4);
      expect(opportunity?.title).not.toBe("");
    },
  );

  it("returns at most three opportunities in a stable order", () => {
    const state = completedScenario("DISCOVERY", {
      Q004: ["WHATSAPP", "WEBSITE"],
      Q005: ["WHATSAPP", "SPREADSHEET", "CRM"],
      D001: "YES",
      D002: "YES",
      D003: "YES",
      D004: "YES",
      D005: "YES",
      D006: "YES",
      D007: "YES",
      D008: "YES",
      D009: "NO_OR_NO_SITE",
      D010: "YES",
    });
    const first = buildDiagnosticResult(state);
    const second = buildDiagnosticResult(state);
    expect(first.opportunities).toHaveLength(3);
    expect(second.opportunities).toEqual(first.opportunities);
  });

  it("uses the declared priority as a tie-breaker", () => {
    const state = completedScenario("INTEGRATION", {
      Q005: ["WHATSAPP", "SPREADSHEET", "CRM"],
      I001: ["CRM", "ERP"],
      I002: "SOMETIMES",
      I004: "WEEKLY",
    });
    const result = buildDiagnosticResult(state);
    expect(result.opportunities[0]?.dimension).toBe("integration");
  });

  it("shows fewer than three recommendations when evidence is weak", () => {
    const state = completedScenario("WEBSITE", {
      W001: "YES",
      W002: ["VISUAL"],
      W003: ["PRESENT"],
      W004: "STRUCTURED",
    });
    expect(buildDiagnosticResult(state).opportunities).toHaveLength(0);
  });

  it("changes evidence and removes stale opportunities after answers change", () => {
    const initial = completedScenario("AUTOMATION", {
      Q005: ["WHATSAPP", "SPREADSHEET", "CRM"],
      A001: "UPDATE_SPREADSHEETS",
      A002: "DAILY",
      A003: "TWO_TO_THREE",
      A004: "THIRTY_TO_SIXTY",
      A005: "FREQUENTLY",
      A007: "FREQUENTLY",
    });
    const before = buildDiagnosticResult(initial);
    expect(
      before.opportunities.some(({ dimension }) => dimension === "integration"),
    ).toBe(true);
    expect(before.opportunities[0]?.evidence.map(({ id }) => id)).toContain(
      "manual_transfer",
    );

    const changed = {
      ...initial,
      answers: {
        ...initial.answers,
        Q005: ["SPREADSHEET"],
        A005: "NO",
      },
    };
    const after = buildDiagnosticResult(changed);
    expect(
      after.opportunities.some(({ dimension }) => dimension === "integration"),
    ).toBe(false);
    expect(after.opportunities[0]?.evidence.map(({ id }) => id)).not.toContain(
      "manual_transfer",
    );
  });

  it("preserves approximate calculator evidence without promising savings", () => {
    const state = completedScenario("AUTOMATION", {
      A001: "REPORTS",
      A002: "DAILY",
      A003: "TWO_TO_THREE",
      A004: "OVER_TWO_HOURS",
      A005: "NO",
      A007: "SOMETIMES",
    });
    const labels = buildDiagnosticResult(state).opportunities.flatMap(
      ({ evidence }) => evidence.map(({ label }) => label),
    );
    expect(
      labels.some((label) => /aproximadamente .*\+ horas por mês/i.test(label)),
    ).toBe(true);
    expect(labels.join(" ")).not.toMatch(/economia|eliminar/i);
  });

  it("downgrades risky AI and adds a mandatory caution", () => {
    const state = completedScenario("AI", {
      AI001: ["ANALYZE_DOCUMENTS"],
      AI002: "HIGH",
      AI003: "YES",
      AI004: "HIGH",
      AI005: "NO",
    });
    const ai = buildDiagnosticResult(state).opportunities.find(
      ({ dimension }) => dimension === "ai",
    );
    expect(ai?.level).toBe("MODERATE");
    expect(ai?.caution).toMatch(/revisão humana/i);
  });

  it("prefers conventional automation when AI has no meaningful evidence", () => {
    const result = buildDiagnosticResult(scenarios.automation);
    expect(result.aiGuidance).toMatch(/automação convencional ou integração/i);
    expect(
      result.opportunities.some(({ dimension }) => dimension === "ai"),
    ).toBe(false);
  });
});
