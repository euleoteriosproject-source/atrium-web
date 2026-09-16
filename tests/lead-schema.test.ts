import { describe, expect, it } from "vitest";

import { leadFormSchema, normalizePhone } from "@/domain/lead/schema";

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
      phone: "+5511999999999",
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
    expect(normalizePhone("(11) 98888-7777")).toBe("11988887777");
  });
});
