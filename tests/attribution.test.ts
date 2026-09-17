import { beforeEach, describe, expect, it } from "vitest";

import {
  ATTRIBUTION_SESSION_KEY,
  captureInitialAttribution,
  loadAttribution,
  readAttribution,
} from "@/domain/lead/attribution";

describe("session attribution", () => {
  beforeEach(() => sessionStorage.clear());

  it("captures supported attribution without keeping arbitrary query data", () => {
    expect(
      readAttribution(
        {
          pathname: "/diagnostico",
          search:
            "?utm_source=linkedin&utm_medium=social&utm_campaign=m5&email=private%40example.com",
        },
        "https://example.com/article?email=private@example.com",
      ),
    ).toEqual({
      utmSource: "linkedin",
      utmMedium: "social",
      utmCampaign: "m5",
      referrer: "https://example.com/article",
      landingPage: "/diagnostico",
    });
  });

  it("accepts a session without UTM values", () => {
    expect(readAttribution({ pathname: "/", search: "" })).toEqual({
      landingPage: "/",
    });
  });

  it("discards oversized attribution values instead of truncating or blocking", () => {
    expect(
      readAttribution({
        pathname: "/diagnostico",
        search: `?utm_source=${"x".repeat(201)}&utm_medium=social`,
      }),
    ).toEqual({
      utmMedium: "social",
      landingPage: "/diagnostico",
    });
  });

  it("preserves the first attribution across internal navigation", () => {
    const first = captureInitialAttribution(
      { pathname: "/", search: "?utm_source=google" },
      "",
      sessionStorage,
    );
    const second = captureInitialAttribution(
      { pathname: "/contato", search: "?utm_source=internal" },
      "",
      sessionStorage,
    );
    expect(second).toEqual(first);
    expect(loadAttribution(sessionStorage)?.utmSource).toBe("google");
    expect(sessionStorage.getItem(ATTRIBUTION_SESSION_KEY)).toContain("google");
  });

  it("discards malformed stored attribution", () => {
    sessionStorage.setItem(ATTRIBUTION_SESSION_KEY, "not-json");
    expect(loadAttribution(sessionStorage)).toBeUndefined();
    expect(sessionStorage.getItem(ATTRIBUTION_SESSION_KEY)).toBeNull();
  });
});
