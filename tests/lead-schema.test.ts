import { describe, expect, it } from "vitest";

import { leadFormSchema } from "@/domain/lead/schema";
import { normalizeBrazilPhone } from "@/supabase/functions/_shared/brazil-phone";

const validForm = {
  contactName: "  Ana Silva  ",
  companyName: "  Empresa Exemplo  ",
  phone: "+55 (11) 99999-9999",
  email: "",
  timeframe: "ONE_TO_THREE_MONTHS",
  budgetRange: "UNDERSTANDING",
  consentContact: true,
  website: "",
};

describe("lead form schema", () => {
  it("normalizes required data and converts an empty optional email to null", () => {
    expect(leadFormSchema.parse(validForm)).toMatchObject({
      contactName: "Ana Silva",
      companyName: "Empresa Exemplo",
      phone: "5511999999999",
      email: null,
    });
  });

  it("accepts a valid optional email", () => {
    expect(
      leadFormSchema.parse({ ...validForm, email: " ana@example.com " }).email,
    ).toBe("ana@example.com");
  });

  it("rejects missing required fields, implausible phone and invalid email", () => {
    expect(
      leadFormSchema.safeParse({
        ...validForm,
        contactName: "",
        phone: "123",
        email: "invalid",
      }).success,
    ).toBe(false);
  });

  it("requires explicit consent and rejects the honeypot", () => {
    expect(
      leadFormSchema.safeParse({ ...validForm, consentContact: false }).success,
    ).toBe(false);
    expect(
      leadFormSchema.safeParse({ ...validForm, website: "bot" }).success,
    ).toBe(false);
  });

  it("rejects unknown timeframe and budget values", () => {
    expect(
      leadFormSchema.safeParse({ ...validForm, timeframe: "TOMORROW" }).success,
    ).toBe(false);
    expect(
      leadFormSchema.safeParse({ ...validForm, budgetRange: "SECRET" }).success,
    ).toBe(false);
  });

  it("normalizes common phone formatting without checking account existence", () => {
    expect(normalizeBrazilPhone("(11) 98888-7777")).toBe("5511988887777");
  });

  it("enforces the name and company boundaries after trimming", () => {
    expect(
      leadFormSchema.safeParse({ ...validForm, contactName: "A " }).success,
    ).toBe(false);
    expect(
      leadFormSchema.safeParse({ ...validForm, contactName: "AB" }).success,
    ).toBe(true);
    expect(
      leadFormSchema.safeParse({
        ...validForm,
        contactName: "A".repeat(80),
      }).success,
    ).toBe(true);
    expect(
      leadFormSchema.safeParse({
        ...validForm,
        contactName: "A".repeat(81),
      }).success,
    ).toBe(false);
    expect(
      leadFormSchema.safeParse({ ...validForm, companyName: "A" }).success,
    ).toBe(false);
    expect(
      leadFormSchema.safeParse({ ...validForm, companyName: "AB" }).success,
    ).toBe(true);
    expect(
      leadFormSchema.safeParse({
        ...validForm,
        companyName: "A".repeat(120),
      }).success,
    ).toBe(true);
    expect(
      leadFormSchema.safeParse({
        ...validForm,
        companyName: "A".repeat(121),
      }).success,
    ).toBe(false);
  });

  it("preserves legitimate punctuation in names", () => {
    expect(
      leadFormSchema.parse({
        ...validForm,
        contactName: "  D'Ávila-Souza  ",
        companyName: "  A&B Serviços, Ltda.  ",
      }),
    ).toMatchObject({
      contactName: "D'Ávila-Souza",
      companyName: "A&B Serviços, Ltda.",
    });
  });

  it("accepts a valid 254-character email and rejects 255 characters", () => {
    const domain = `${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(57)}.com`;
    const email254 = `${"a".repeat(64)}@${domain}`;
    const email255 = `${"a".repeat(65)}@${domain}`;
    expect(email254).toHaveLength(254);
    expect(email255).toHaveLength(255);
    expect(
      leadFormSchema.safeParse({ ...validForm, email: email254 }).success,
    ).toBe(true);
    expect(
      leadFormSchema.safeParse({ ...validForm, email: email255 }).success,
    ).toBe(false);
  });
});
