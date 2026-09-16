import { z } from "zod";

import { diagnosticStateSchema } from "@/domain/diagnostic/types";

export const timeframeValues = [
  "NOW",
  "ONE_TO_THREE_MONTHS",
  "THREE_TO_SIX_MONTHS",
  "EXPLORING",
] as const;

export const budgetRangeValues = [
  "UNDERSTANDING",
  "UP_TO_3000",
  "FROM_3000_TO_7500",
  "FROM_7500_TO_15000",
  "FROM_15000_TO_30000",
  "ABOVE_30000",
] as const;

export const timeframeLabels: Record<Timeframe, string> = {
  NOW: "Agora / o quanto antes",
  ONE_TO_THREE_MONTHS: "Nos próximos 1–3 meses",
  THREE_TO_SIX_MONTHS: "Nos próximos 3–6 meses",
  EXPLORING: "Estou explorando",
};

export const budgetRangeLabels: Record<BudgetRange, string> = {
  UNDERSTANDING: "Ainda estou entendendo",
  UP_TO_3000: "Até R$ 3.000",
  FROM_3000_TO_7500: "R$ 3.000–7.500",
  FROM_7500_TO_15000: "R$ 7.500–15.000",
  FROM_15000_TO_30000: "R$ 15.000–30.000",
  ABOVE_30000: "Acima de R$ 30.000",
};

export const timeframeSchema = z.enum(timeframeValues);
export const budgetRangeSchema = z.enum(budgetRangeValues);

export type Timeframe = z.infer<typeof timeframeSchema>;
export type BudgetRange = z.infer<typeof budgetRangeSchema>;

const trimmed = (minimum: number, maximum: number, label: string) =>
  z
    .string()
    .trim()
    .min(minimum, `Informe ${label}.`)
    .max(maximum, `${label} excede o limite permitido.`);

export function normalizePhone(value: string) {
  const trimmedValue = value.trim();
  const digits = trimmedValue.replace(/\D/g, "");
  return `${trimmedValue.startsWith("+") ? "+" : ""}${digits}`;
}

const phoneSchema = z
  .string()
  .trim()
  .max(32)
  .refine((value) => {
    const length = value.replace(/\D/g, "").length;
    return length >= 10 && length <= 15;
  }, "Informe um WhatsApp com 10 a 15 dígitos.")
  .transform(normalizePhone);

const optionalEmailSchema = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .email("Informe um e-mail válido.")
      .max(254, "O e-mail excede o limite permitido."),
  ])
  .transform((value) => value || null);

const optionalTimeframeSchema = z
  .union([z.literal(""), timeframeSchema])
  .transform((value) => value || null);

const optionalBudgetSchema = z
  .union([z.literal(""), budgetRangeSchema])
  .transform((value) => value || null);

export const leadFormSchema = z.object({
  contactName: trimmed(2, 100, "seu nome"),
  companyName: trimmed(2, 120, "a empresa ou negócio"),
  phone: phoneSchema,
  email: optionalEmailSchema,
  timeframe: optionalTimeframeSchema,
  budgetRange: optionalBudgetSchema,
  consentContact: z.boolean().refine((value) => value, {
    message: "Confirme o consentimento para enviar o diagnóstico.",
  }),
  website: z.string().max(0, "Não foi possível enviar o formulário."),
});

export type LeadFormInput = z.input<typeof leadFormSchema>;
export type LeadFormData = z.output<typeof leadFormSchema>;

export const leadContactSchema = z.object({
  contactName: trimmed(2, 100, "seu nome"),
  companyName: trimmed(2, 120, "a empresa ou negócio"),
  phone: phoneSchema,
  email: z.string().trim().email().max(254).nullable(),
  timeframe: timeframeSchema.nullable(),
  budgetRange: budgetRangeSchema.nullable(),
  consentContact: z.literal(true),
});

export const attributionSchema = z.object({
  source: z.string().trim().max(100).optional(),
  utmSource: z.string().trim().max(200).optional(),
  utmMedium: z.string().trim().max(200).optional(),
  utmCampaign: z.string().trim().max(200).optional(),
  utmContent: z.string().trim().max(200).optional(),
  utmTerm: z.string().trim().max(200).optional(),
  referrer: z.string().trim().max(500).optional(),
  landingPage: z.string().trim().max(500).optional(),
});

export type Attribution = z.infer<typeof attributionSchema>;

export const leadSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  contact: leadContactSchema,
  diagnostic: diagnosticStateSchema.refine(
    (state) => state.stage === "complete" && Boolean(state.primaryGoal),
    "Diagnóstico incompleto.",
  ),
  attribution: attributionSchema.optional(),
  turnstileToken: z.string().min(1).max(2048),
  website: z.string().max(0),
});

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

export const createLeadResponseSchema = z
  .object({
    success: z.literal(true),
    publicCode: z.string().regex(/^AT-[0-9]{2}-[A-Z0-9]{6}$/),
  })
  .strict();

export type CreateLeadResponse = z.infer<typeof createLeadResponseSchema>;
