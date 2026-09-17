import { z } from "zod";

import { diagnosticStateSchema } from "@/domain/diagnostic/types";
import {
  brazilPhoneValidationIssue,
  normalizeBrazilPhone,
} from "@/supabase/functions/_shared/brazil-phone";
import {
  budgetRangeValues,
  leadEmailPattern,
  leadFieldLimits,
  timeframeValues,
} from "@/supabase/functions/_shared/lead-constraints";
import { editorialTimeframeLabels } from "@/supabase/functions/_shared/lead-editorial-labels";

export { budgetRangeValues, timeframeValues };

export const timeframeLabels: Record<Timeframe, string> =
  editorialTimeframeLabels;

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

const trimmed = (
  minimum: number,
  maximum: number,
  messages: { minimum: string; maximum: string },
) =>
  z
    .string()
    .trim()
    .min(minimum, messages.minimum)
    .max(maximum, messages.maximum);

const phoneSchema = z
  .string()
  .trim()
  .max(leadFieldLimits.phone.serverInputMaximum, "Confira o número informado.")
  .superRefine((value, context) => {
    const issue = brazilPhoneValidationIssue(value);
    if (!issue) return;
    context.addIssue({
      code: "custom",
      message:
        issue === "INCOMPLETE"
          ? "Informe um WhatsApp com DDD."
          : "Confira o número informado.",
    });
  })
  .transform((value) => normalizeBrazilPhone(value) as string);

const validEmail = z.string().regex(leadEmailPattern);

const optionalEmailSchema = z
  .string()
  .trim()
  .max(leadFieldLimits.email.maximum, "O e-mail excede o limite permitido.")
  .refine(
    (value) => !value || validEmail.safeParse(value).success,
    "Informe um e-mail válido.",
  )
  .transform((value) => value || null);

const optionalTimeframeSchema = z
  .union([z.literal(""), timeframeSchema])
  .transform((value) => value || null);

const optionalBudgetSchema = z
  .union([z.literal(""), budgetRangeSchema])
  .transform((value) => value || null);

export const leadFormSchema = z.object({
  contactName: trimmed(
    leadFieldLimits.contactName.minimum,
    leadFieldLimits.contactName.maximum,
    {
      minimum: "Informe seu nome com pelo menos 2 caracteres.",
      maximum: "Seu nome excede o limite permitido.",
    },
  ),
  companyName: trimmed(
    leadFieldLimits.companyName.minimum,
    leadFieldLimits.companyName.maximum,
    {
      minimum: "Informe a empresa com pelo menos 2 caracteres.",
      maximum: "O nome da empresa excede o limite permitido.",
    },
  ),
  phone: phoneSchema,
  email: optionalEmailSchema,
  timeframe: optionalTimeframeSchema,
  budgetRange: optionalBudgetSchema,
  consentContact: z.boolean().refine((value) => value, {
    message: "Confirme o consentimento para enviar o diagnóstico.",
  }),
  website: z
    .string()
    .max(
      leadFieldLimits.honeypot.maximum,
      "Não foi possível enviar o formulário.",
    ),
});

export type LeadFormInput = z.input<typeof leadFormSchema>;
export type LeadFormData = z.output<typeof leadFormSchema>;

export const leadContactSchema = z.object({
  contactName: trimmed(
    leadFieldLimits.contactName.minimum,
    leadFieldLimits.contactName.maximum,
    {
      minimum: "Informe seu nome com pelo menos 2 caracteres.",
      maximum: "Seu nome excede o limite permitido.",
    },
  ),
  companyName: trimmed(
    leadFieldLimits.companyName.minimum,
    leadFieldLimits.companyName.maximum,
    {
      minimum: "Informe a empresa com pelo menos 2 caracteres.",
      maximum: "O nome da empresa excede o limite permitido.",
    },
  ),
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .email()
    .max(leadFieldLimits.email.maximum)
    .nullable(),
  timeframe: timeframeSchema.nullable(),
  budgetRange: budgetRangeSchema.nullable(),
  consentContact: z.literal(true),
});

export const attributionSchema = z.object({
  source: z.string().trim().max(leadFieldLimits.attribution.source).optional(),
  utmSource: z
    .string()
    .trim()
    .max(leadFieldLimits.attribution.utmSource)
    .optional(),
  utmMedium: z
    .string()
    .trim()
    .max(leadFieldLimits.attribution.utmMedium)
    .optional(),
  utmCampaign: z
    .string()
    .trim()
    .max(leadFieldLimits.attribution.utmCampaign)
    .optional(),
  utmContent: z
    .string()
    .trim()
    .max(leadFieldLimits.attribution.utmContent)
    .optional(),
  utmTerm: z
    .string()
    .trim()
    .max(leadFieldLimits.attribution.utmTerm)
    .optional(),
  referrer: z
    .string()
    .trim()
    .max(leadFieldLimits.attribution.referrer)
    .optional(),
  landingPage: z
    .string()
    .trim()
    .max(leadFieldLimits.attribution.landingPage)
    .optional(),
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
  turnstileToken: z.string().min(1).max(leadFieldLimits.turnstileToken.maximum),
  website: z.string().max(leadFieldLimits.honeypot.maximum),
});

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

export const createLeadResponseSchema = z
  .object({
    success: z.literal(true),
    publicCode: z.string().regex(/^AT-[0-9]{2}-[A-Z0-9]{6}$/),
  })
  .strict();

export type CreateLeadResponse = z.infer<typeof createLeadResponseSchema>;
