import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());

const optionalPublicValue = z.preprocess(
  emptyToUndefined,
  z.string().min(1).optional(),
);

const optionalWhatsAppNumber = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .min(8)
    .max(32)
    .regex(/^\+?[0-9()\s-]+$/, "Número de WhatsApp inválido")
    .optional(),
);

export const publicEnvSchema = z
  .object({
    NEXT_PUBLIC_SITE_URL: optionalUrl,
    NEXT_PUBLIC_WHATSAPP_NUMBER: optionalWhatsAppNumber,
    NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalPublicValue,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalPublicValue,
  })
  .strict();

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function parsePublicEnv(
  input: Record<string, string | undefined>,
): PublicEnv {
  return publicEnvSchema.parse(input);
}

export const publicEnv = parsePublicEnv({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
});
