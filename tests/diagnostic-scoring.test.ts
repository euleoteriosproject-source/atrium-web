import { describe, expect, it } from "vitest";

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
    ...createDiagnosticState(new Date("2026-01-01T00:00:00.000Z")),
    primaryGoal: goal,
    answers: { Q001: [goal], ...answers },
  };
}

describe("diagnostic scoring", () => {
  it.each([
    ["SALES", { sales: 2, digital: 1 }],
    ["CONVERSION", { sales: 3, service: 1 }],
    ["AUTOMATION", { automation: 3 }],
    ["SERVICE", { service: 3 }],
    ["WEBSITE", { digital: 3, sales: 1 }],
    ["SOFTWARE", { software: 3 }],
    ["INTEGRATION", { integration: 3, automation: 1 }],
    ["AI", { ai: 2 }],
    ["DISCOVERY", {}],
  ] as const)("applies the initial %s mapping", (goal, expected) => {
    expect(calculateOpportunityScores(scenario(goal, {}))).toMatchObject(
      expected,
    );
  });

  it("adds only the principal-goal score and universal evidence", () => {
    const state = {
      ...scenario("AUTOMATION", {
        Q004: ["WHATSAPP", "WEBSITE"],
        Q005: ["WHATSAPP", "SPREADSHEET", "EMAIL"],
      }),
      additionalGoals: ["AI" as Goal],
    };

    expect(calculateOpportunityScores(state)).toEqual({
      digital: 1,
      sales: 1,
      service: 1,
      automation: 4,
      integration: 2,
      software: 0,
      ai: 0,
    });
  });

  it("scores the automation branch deterministically", () => {
    const scores = calculateOpportunityScores(
      scenario("AUTOMATION", {
        A001: "MOVE_DATA",
        A002: "MANY_DAILY",
        A005: "FREQUENTLY",
        A006: "YES",
        A007: "FREQUENTLY",
      }),
    );
    expect(scores.automation).toBe(15);
    expect(scores.integration).toBe(5);
    expect(scores.software).toBe(1);
  });

  it("scores sales and conversion with the shared branch", () => {
    const answers = {
      S001: "NOWHERE",
      S002: "OVER_DAY",
      S003: "NO",
      S004: "ALMOST_NONE",
      S005: "NO",
      S006: "REDISCOVER",
    };
    const sales = calculateOpportunityScores(scenario("SALES", answers));
    const conversion = calculateOpportunityScores(
      scenario("CONVERSION", answers),
    );

    expect(sales.sales).toBe(17);
    expect(sales.automation).toBe(2);
    expect(sales.service).toBe(2);
    expect(conversion.sales).toBe(18);
    expect(conversion.service).toBe(3);
  });

  it("scores service evidence across repeated work and disconnected channels", () => {
    const scores = calculateOpportunityScores(
      scenario("SERVICE", {
        C001: ["WHATSAPP", "EMAIL", "PHONE"],
        C002: "MANY",
        C003: "ALMOST_ALWAYS",
        C004: "FREQUENTLY",
        C005: "FREQUENTLY",
        C006: "YES",
      }),
    );
    expect(scores.service).toBe(16);
    expect(scores.automation).toBe(6);
    expect(scores.integration).toBe(3);
    expect(scores.software).toBe(1);
  });

  it("scores website problems, desired role and manual handoff", () => {
    const scores = calculateOpportunityScores(
      scenario("WEBSITE", {
        W001: "YES",
        W002: [
          "NO_CONTACTS",
          "SLOW",
          "BAD_MOBILE",
          "NO_INTEGRATION",
          "UNKNOWN_RESULT",
        ],
        W003: ["QUALIFY", "CLIENT_AREA", "BOOKING"],
        W004: "SPREADSHEET",
      }),
    );
    expect(scores.digital).toBe(11);
    expect(scores.sales).toBe(5);
    expect(scores.automation).toBe(2);
    expect(scores.integration).toBe(2);
    expect(scores.software).toBe(2);
  });

  it("scores software maturity without inventing points for unspecified options", () => {
    const explicit = calculateOpportunityScores(
      scenario("SOFTWARE", {
        SW001: "MULTIPLE_SYSTEMS",
        SW004: "CLEAR",
      }),
    );
    const unspecified = calculateOpportunityScores(
      scenario("SOFTWARE", {
        SW001: "PAPER_DOCUMENTS",
        SW004: "IDEA",
      }),
    );
    expect(explicit.software).toBe(7);
    expect(explicit.integration).toBe(2);
    expect(unspecified.software).toBe(3);
  });

  it("scores integration volume and manual bridges", () => {
    const scores = calculateOpportunityScores(
      scenario("INTEGRATION", {
        I001: ["CRM", "ERP"],
        I002: "FREQUENTLY",
        I004: "MANY_DAILY",
      }),
    );
    expect(scores.integration).toBe(11);
    expect(scores.automation).toBe(3);
  });

  it("keeps AI opportunity and AI risk as independent counters", () => {
    const state = scenario("AI", {
      AI001: ["ANALYZE_DOCUMENTS", "DECISIONS"],
      AI002: "HIGH",
      AI003: "YES",
      AI004: "HIGH",
      AI005: "YES",
    });
    expect(calculateOpportunityScores(state).ai).toBe(9);
    expect(calculateAiRiskScore(state)).toBe(3);
  });

  it("allows the explicit negative AI evidence", () => {
    const state = scenario("AI", { AI001: ["UNKNOWN"], AI002: "NO" });
    expect(calculateOpportunityScores(state).ai).toBe(1);
  });

  it("scores only explicit yes answers in the discovery scanner", () => {
    const scores = calculateOpportunityScores(
      scenario("DISCOVERY", {
        D001: "SOMETIMES",
        D003: "YES",
        D007: "YES",
        D009: "PARTIAL",
        D010: "YES",
      }),
    );
    expect(scores).toEqual({
      digital: 1,
      sales: 1,
      service: 0,
      automation: 2,
      integration: 7,
      software: 1,
      ai: 0,
    });
  });

  it("drops stale answers from a previous branch after the goal changes", () => {
    const state = scenario("AUTOMATION", { A007: "FREQUENTLY" });
    const first = calculateOpportunityScores(state);
    const changed = calculateOpportunityScores({
      ...state,
      primaryGoal: "WEBSITE",
      answers: { ...state.answers, Q001: ["WEBSITE"] },
    });
    expect(first.automation).toBe(6);
    expect(changed.automation).toBe(0);
    expect(changed.digital).toBe(3);
  });

  it("recalculation removes points when an answer is replaced", () => {
    const state = scenario("AUTOMATION", { A007: "FREQUENTLY" });
    expect(calculateOpportunityScores(state).automation).toBe(6);
    expect(
      calculateOpportunityScores({
        ...state,
        answers: { ...state.answers, A007: "RARELY" },
      }).automation,
    ).toBe(3);
  });
});
