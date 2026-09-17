export const leadFieldLimits = {
  contactName: { minimum: 2, maximum: 80 },
  companyName: { minimum: 2, maximum: 120 },
  email: { maximum: 254 },
  phone: {
    nationalMinimum: 10,
    nationalMaximum: 11,
    canonicalMinimum: 12,
    canonicalMaximum: 13,
    inputMaximum: 19,
    serverInputMaximum: 32,
  },
  honeypot: { maximum: 0 },
  turnstileToken: { maximum: 2048 },
  attribution: {
    source: 100,
    utmSource: 200,
    utmMedium: 200,
    utmCampaign: 200,
    utmContent: 200,
    utmTerm: 200,
    referrer: 500,
    landingPage: 500,
  },
} as const;

export const leadEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export type TimeframeValue = (typeof timeframeValues)[number];
export type BudgetRangeValue = (typeof budgetRangeValues)[number];

export function isAllowedValue<Value extends string>(
  value: unknown,
  values: readonly Value[],
): value is Value {
  return typeof value === "string" && values.includes(value as Value);
}
