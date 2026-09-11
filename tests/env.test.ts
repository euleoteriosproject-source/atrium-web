import { describe, expect, it } from "vitest";

import { parsePublicEnv } from "@/lib/env";

describe("public environment", () => {
  it("allows omitted values during local builds", () => {
    expect(parsePublicEnv({})).toEqual({});
  });

  it("accepts valid public configuration", () => {
    expect(
      parsePublicEnv({
        NEXT_PUBLIC_SITE_URL: "https://atrium.example",
        NEXT_PUBLIC_WHATSAPP_NUMBER: "+55 11 99999-9999",
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "public-site-key",
      }),
    ).toMatchObject({
      NEXT_PUBLIC_SITE_URL: "https://atrium.example",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
    });
  });

  it("rejects malformed URLs", () => {
    expect(() =>
      parsePublicEnv({ NEXT_PUBLIC_SITE_URL: "not-a-url" }),
    ).toThrow();
  });
});
