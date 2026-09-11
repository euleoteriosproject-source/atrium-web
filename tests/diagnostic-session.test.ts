import { describe, expect, it } from "vitest";

import { createDiagnosticState } from "@/domain/diagnostic/types";
import {
  clearDiagnosticSession,
  DIAGNOSTIC_SESSION_KEY,
  loadDiagnosticSession,
  saveDiagnosticSession,
} from "@/lib/session";

describe("diagnostic session", () => {
  it("round-trips a valid versioned state", () => {
    const state = {
      ...createDiagnosticState(new Date("2026-01-01")),
      primaryGoal: "AUTOMATION" as const,
      stage: "questions" as const,
      currentQuestionId: "A002",
      answers: { Q001: ["AUTOMATION"], A001: ["MOVE_DATA"] },
    };
    saveDiagnosticSession(state, sessionStorage);
    expect(loadDiagnosticSession(sessionStorage)).toEqual(state);
  });

  it("clears corrupted JSON safely", () => {
    sessionStorage.setItem(DIAGNOSTIC_SESSION_KEY, "{bad-json");
    expect(loadDiagnosticSession(sessionStorage)).toBeNull();
    expect(sessionStorage.getItem(DIAGNOSTIC_SESSION_KEY)).toBeNull();
  });

  it("rejects data from another schema version", () => {
    sessionStorage.setItem(
      DIAGNOSTIC_SESSION_KEY,
      JSON.stringify({ ...createDiagnosticState(), version: "0.9.0" }),
    );
    expect(loadDiagnosticSession(sessionStorage)).toBeNull();
  });

  it("supports an explicit reset", () => {
    saveDiagnosticSession(createDiagnosticState(), sessionStorage);
    clearDiagnosticSession(sessionStorage);
    expect(loadDiagnosticSession(sessionStorage)).toBeNull();
  });
});
