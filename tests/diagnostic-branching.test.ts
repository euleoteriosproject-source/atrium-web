import { describe, expect, it } from "vitest";

import {
  getApplicableQuestions,
  shouldStopDiscovery,
} from "@/domain/diagnostic/branching";
import { allQuestions } from "@/domain/diagnostic/questions";
import {
  createDiagnosticState,
  type DiagnosticAnswer,
  type Goal,
} from "@/domain/diagnostic/types";

function state(goal: Goal, answers: Record<string, DiagnosticAnswer> = {}) {
  return {
    ...createDiagnosticState(),
    primaryGoal: goal,
    answers: { Q001: [goal], ...answers },
  };
}

describe("diagnostic branching", () => {
  it("declares all 51 M3 questions with unique IDs", () => {
    expect(allQuestions).toHaveLength(51);
    expect(new Set(allQuestions.map(({ id }) => id)).size).toBe(51);
  });

  it.each([
    ["AUTOMATION", "A001", 12],
    ["SALES", "S001", 11],
    ["CONVERSION", "S001", 11],
    ["SERVICE", "C001", 11],
    ["SOFTWARE", "SW001", 9],
    ["INTEGRATION", "I001", 9],
    ["AI", "AI001", 10],
    ["DISCOVERY", "D001", 15],
  ] as const)("routes %s to %s", (goal, firstBranchId, length) => {
    const questions = getApplicableQuestions(state(goal));
    expect(questions[5]?.id).toBe(firstBranchId);
    expect(questions).toHaveLength(length);
  });

  it("shows the website detail only when a site exists", () => {
    expect(
      getApplicableQuestions(state("WEBSITE", { W001: "YES" })).map(
        ({ id }) => id,
      ),
    ).toContain("W002");
    expect(
      getApplicableQuestions(state("WEBSITE", { W001: "NO" })).map(
        ({ id }) => id,
      ),
    ).not.toContain("W002");
  });

  it("does not stop discovery before seven answered questions", () => {
    expect(
      shouldStopDiscovery(
        state("DISCOVERY", {
          Q002: "SERVICES",
          Q003: "ONE",
          Q004: ["WHATSAPP"],
          Q005: ["WHATSAPP", "SPREADSHEET", "EMAIL"],
          D001: "YES",
        }),
      ),
    ).toBe(false);
  });

  it("stops discovery after three dimensions have strong evidence", () => {
    const discovery = state("DISCOVERY", {
      Q002: "SERVICES",
      Q003: "ONE",
      Q004: ["WHATSAPP"],
      Q005: ["WHATSAPP", "SPREADSHEET", "EMAIL"],
      D001: "YES",
      D002: "YES",
      D003: "YES",
      D004: "YES",
    });
    expect(shouldStopDiscovery(discovery)).toBe(true);
    expect(getApplicableQuestions(discovery).at(-1)?.id).toBe("D004");
  });
});
