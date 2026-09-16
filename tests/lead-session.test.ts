import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getOrCreateLeadSubmissionId,
  LEAD_SUBMISSION_SESSION_KEY,
} from "@/domain/lead/session";

describe("lead submission session", () => {
  beforeEach(() => sessionStorage.clear());

  it("reuses the submission id for the same diagnostic", () => {
    const randomUUID = vi
      .spyOn(window.crypto, "randomUUID")
      .mockReturnValue("123e4567-e89b-42d3-a456-426614174000");
    const first = getOrCreateLeadSubmissionId(
      "2026-09-11T00:00:00.000Z",
      sessionStorage,
    );
    const second = getOrCreateLeadSubmissionId(
      "2026-09-11T00:00:00.000Z",
      sessionStorage,
    );
    expect(first).toBe(second);
    expect(randomUUID).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(LEAD_SUBMISSION_SESSION_KEY)).not.toContain(
      "Ana",
    );
    randomUUID.mockRestore();
  });

  it("creates a new id for a different diagnostic", () => {
    vi.spyOn(window.crypto, "randomUUID")
      .mockReturnValueOnce("123e4567-e89b-42d3-a456-426614174000")
      .mockReturnValueOnce("223e4567-e89b-42d3-a456-426614174000");
    const first = getOrCreateLeadSubmissionId(
      "2026-09-11T00:00:00.000Z",
      sessionStorage,
    );
    const second = getOrCreateLeadSubmissionId(
      "2026-09-12T00:00:00.000Z",
      sessionStorage,
    );
    expect(second).not.toBe(first);
  });
});
