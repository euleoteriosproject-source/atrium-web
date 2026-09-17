import { describe, expect, it } from "vitest";

import {
  brazilPhoneValidationIssue,
  caretPositionForNationalDigits,
  countNationalDigitsBeforeCaret,
  extractPhoneDigits,
  formatBrazilPhone,
  normalizeBrazilPhone,
} from "@/supabase/functions/_shared/brazil-phone";

describe("Brazil phone helpers", () => {
  it("extracts digits without applying normalization", () => {
    expect(extractPhoneDigits("+55 (51) 98289-5068")).toBe("5551982895068");
  });

  it.each([
    ["(51) 98289-5068", "5551982895068"],
    ["51982895068", "5551982895068"],
    ["+55 51 98289-5068", "5551982895068"],
    ["5551982895068", "5551982895068"],
    ["5133334444", "555133334444"],
  ])("normalizes %s to canonical digits", (input, expected) => {
    expect(normalizeBrazilPhone(input)).toBe(expected);
  });

  it("does not confuse Brazilian area code 55 with the country code", () => {
    expect(normalizeBrazilPhone("5599999999")).toBe("555599999999");
    expect(formatBrazilPhone("5599999999")).toBe("+55 (55) 9999-9999");
  });

  it.each([
    ["51982895068", "+55 (51) 98289-5068"],
    ["+55 (51) 98289-5068", "+55 (51) 98289-5068"],
    ["5133334444", "+55 (51) 3333-4444"],
    ["51982", "+55 (51) 982"],
  ])("formats %s progressively", (input, expected) => {
    expect(formatBrazilPhone(input)).toBe(expected);
  });

  it("keeps an incomplete number formattable but not normalizable", () => {
    expect(formatBrazilPhone("519828950")).toBe("+55 (51) 9828-950");
    expect(normalizeBrazilPhone("519828950")).toBeUndefined();
    expect(brazilPhoneValidationIssue("519828950")).toBe("INCOMPLETE");
  });

  it.each([
    ["519828950680", "INVALID"],
    ["+1 (212) 555-0100", "INVALID"],
    ["abc51982895068", "INVALID"],
    ["++55 51 98289-5068", "INVALID"],
  ] as const)("rejects invalid input %s", (input, issue) => {
    expect(normalizeBrazilPhone(input)).toBeUndefined();
    expect(formatBrazilPhone(input)).toBeUndefined();
    expect(brazilPhoneValidationIssue(input)).toBe(issue);
  });

  it("maps a caret by national digit count instead of visual separators", () => {
    const raw = "+55 (51) 97289-5068";
    const caret = raw.indexOf("7") + 1;
    const digitsBeforeCaret = countNationalDigitsBeforeCaret(raw, caret);
    const formatted = formatBrazilPhone(raw);
    expect(digitsBeforeCaret).toBe(4);
    expect(formatted).toBeDefined();
    const nextCaret = caretPositionForNationalDigits(
      formatted ?? "",
      digitsBeforeCaret,
    );
    expect((formatted ?? "").slice(0, nextCaret)).toMatch(/97$/);
  });
});
