import { describe, expect, it } from "vitest";

import {
  buildDiagnosticHref,
  parseDiagnosticPreload,
  stateFromPreload,
} from "@/domain/diagnostic/preselection";

describe("diagnostic URL preselection", () => {
  it("accepts every valid goal without auto-advancing", () => {
    const preload = parseDiagnosticPreload("?goal=INTEGRATION");
    const state = stateFromPreload(preload, new Date("2026-01-01"));
    expect(state.primaryGoal).toBe("INTEGRATION");
    expect(state.answers.Q001).toEqual(["INTEGRATION"]);
    expect(state.stage).toBe("intro");
  });

  it("ignores invalid goal values", () => {
    expect(parseDiagnosticPreload("?goal=BLOCKCHAIN").goal).toBeUndefined();
  });

  it("validates calculator parameters and recalculates trusted hours", () => {
    const preload = parseDiagnosticPreload(
      "?goal=AUTOMATION&people=3&minutesPerDay=30&daysPerWeek=5&monthlyHours=999999",
    );
    expect(preload.calculator).toEqual({
      people: 3,
      minutesPerDay: 30,
      daysPerWeek: 5,
      estimatedMonthlyHours: 32.475,
    });
  });

  it.each([
    "?people=-1&minutesPerDay=30&daysPerWeek=5",
    "?people=3&minutesPerDay=9999&daysPerWeek=5",
    "?people=3&minutesPerDay=30&daysPerWeek=0",
    "?people=x&minutesPerDay=30&daysPerWeek=5",
  ])("rejects malformed or absurd calculator input: %s", (search) => {
    expect(parseDiagnosticPreload(search).calculator).toBeUndefined();
  });

  it("builds an explicit calculator handoff URL", () => {
    expect(
      buildDiagnosticHref({
        goal: "AUTOMATION",
        calculator: {
          people: 2,
          minutesPerDay: 20,
          daysPerWeek: 4,
          estimatedMonthlyHours: 11.5466666667,
        },
      }),
    ).toBe(
      "/diagnostico?goal=AUTOMATION&people=2&minutesPerDay=20&daysPerWeek=4&monthlyHours=11.5466666667",
    );
  });
});
