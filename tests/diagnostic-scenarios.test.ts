import { describe, expect, it } from "vitest";

import { deriveAutomationCalculator } from "@/domain/diagnostic/calculator";
import { shouldStopDiscovery } from "@/domain/diagnostic/branching";
import { parseDiagnosticPreload } from "@/domain/diagnostic/preselection";
import {
  calculateAiRiskScore,
  calculateOpportunityScores,
} from "@/domain/diagnostic/scoring";
import {
  createDiagnosticState,
  type DiagnosticAnswer,
  type Goal,
} from "@/domain/diagnostic/types";

function scenario(goal: Goal, answers: Record<string, DiagnosticAnswer>) {
  return {
    ...createDiagnosticState(),
    primaryGoal: goal,
    answers: { Q001: [goal], ...answers },
  };
}

describe("M3 acceptance scenarios", () => {
  it("A — accumulates strong automation and integration evidence", () => {
    const state = scenario("AUTOMATION", {
      Q005: ["WHATSAPP", "SPREADSHEET"],
      A001: "COPY_REGISTER",
      A002: "DAILY",
      A003: "TWO_TO_THREE",
      A004: "THIRTY_TO_SIXTY",
      A005: "FREQUENTLY",
      A007: "FREQUENTLY",
    });
    const scores = calculateOpportunityScores(state);
    expect(scores.automation).toBeGreaterThanOrEqual(7);
    expect(scores.integration).toBeGreaterThanOrEqual(4);
    expect(
      deriveAutomationCalculator(state)?.estimatedMonthlyHours,
    ).toBeCloseTo(40.59375);
  });

  it("B — identifies coherent commercial evidence", () => {
    const scores = calculateOpportunityScores(
      scenario("SALES", {
        Q005: ["WHATSAPP", "SPREADSHEET"],
        S001: "WHATSAPP",
        S002: "OVER_DAY",
        S004: "ALMOST_NONE",
        S006: "REDISCOVER",
      }),
    );
    expect(scores.sales).toBeGreaterThanOrEqual(7);
    expect(scores.service).toBeGreaterThan(0);
  });

  it("C — keeps site and post-contact evidence coherent", () => {
    const scores = calculateOpportunityScores(
      scenario("WEBSITE", {
        W001: "YES",
        W002: ["NO_CONTACTS", "UNKNOWN_RESULT"],
        W003: ["QUALIFY"],
        W004: "NO_PROCESS",
      }),
    );
    expect(scores.digital).toBeGreaterThanOrEqual(7);
    expect(scores.sales).toBeGreaterThanOrEqual(4);
  });

  it("D — records high AI risk without applying an M4 priority adjustment", () => {
    const state = scenario("AI", {
      AI001: ["ANALYZE_DOCUMENTS"],
      AI002: "HIGH",
      AI003: "YES",
      AI004: "HIGH",
      AI005: "NO",
    });
    expect(calculateOpportunityScores(state).ai).toBe(8);
    expect(calculateAiRiskScore(state)).toBe(3);
  });

  it("E — stops discovery only after enough answers and three strong areas", () => {
    const state = scenario("DISCOVERY", {
      Q002: "SERVICES",
      Q003: "TWO_TO_FIVE",
      Q004: ["WHATSAPP"],
      Q005: ["WHATSAPP", "SPREADSHEET", "EMAIL"],
      D001: "YES",
      D002: "YES",
      D003: "YES",
      D004: "YES",
    });
    expect(shouldStopDiscovery(state)).toBe(true);
  });

  it("F — carries valid calculator context into the diagnostic", () => {
    expect(
      parseDiagnosticPreload(
        "?goal=AUTOMATION&people=3&minutesPerDay=30&daysPerWeek=5&monthlyHours=32.475",
      ),
    ).toMatchObject({
      goal: "AUTOMATION",
      calculator: {
        people: 3,
        minutesPerDay: 30,
        daysPerWeek: 5,
        estimatedMonthlyHours: 32.475,
      },
    });
  });
});
