import { leadFieldLimits } from "./lead-constraints.ts";

export type BrazilPhoneValidationIssue = "INCOMPLETE" | "INVALID";

const allowedCharacters = /^[+0-9().\-\s]+$/;

export function extractPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

function hasValidCharacters(value: string) {
  const plusCount = value.match(/\+/g)?.length ?? 0;
  return (
    allowedCharacters.test(value) &&
    plusCount <= 1 &&
    (plusCount === 0 || value.startsWith("+"))
  );
}

function nationalDigits(value: string) {
  const normalized = value.trim();
  if (!normalized || !hasValidCharacters(normalized)) return undefined;

  const digits = extractPhoneDigits(normalized);
  if (normalized.startsWith("+")) {
    if (!digits.startsWith("55")) return undefined;
    const national = digits.slice(2);
    return national.length >= leadFieldLimits.phone.nationalMinimum &&
      national.length <= leadFieldLimits.phone.nationalMaximum
      ? national
      : undefined;
  }

  if (digits.length === 12 || digits.length === 13) {
    if (!digits.startsWith("55")) return undefined;
    return digits.slice(2);
  }

  return digits.length >= leadFieldLimits.phone.nationalMinimum &&
    digits.length <= leadFieldLimits.phone.nationalMaximum
    ? digits
    : undefined;
}

export function normalizeBrazilPhone(value: string) {
  const national = nationalDigits(value);
  return national ? `55${national}` : undefined;
}

export function brazilPhoneValidationIssue(
  value: string,
): BrazilPhoneValidationIssue | undefined {
  if (normalizeBrazilPhone(value)) return undefined;

  const normalized = value.trim();
  if (!normalized) return "INCOMPLETE";
  if (!hasValidCharacters(normalized)) return "INVALID";

  const digits = extractPhoneDigits(normalized);
  const nationalLength = normalized.startsWith("+")
    ? digits.startsWith("55")
      ? Math.max(0, digits.length - 2)
      : digits.length
    : digits.length === 12 || digits.length === 13
      ? digits.startsWith("55")
        ? digits.length - 2
        : digits.length
      : digits.length;

  return nationalLength < leadFieldLimits.phone.nationalMinimum
    ? "INCOMPLETE"
    : "INVALID";
}

function nationalDigitsForDisplay(value: string) {
  const normalized = value.trim();
  if (!normalized) return "";
  if (normalized === "+" || normalized === "+5") return "";
  if (!hasValidCharacters(normalized)) return undefined;

  const digits = extractPhoneDigits(normalized);
  if (normalized.startsWith("+")) {
    if (!digits.startsWith("55")) return undefined;
    const national = digits.slice(2);
    return national.length <= leadFieldLimits.phone.nationalMaximum
      ? national
      : undefined;
  }

  if (digits.length >= 12) {
    if (
      !digits.startsWith("55") ||
      digits.length > leadFieldLimits.phone.canonicalMaximum
    ) {
      return undefined;
    }
    return digits.slice(2);
  }

  return digits.length <= leadFieldLimits.phone.nationalMaximum
    ? digits
    : undefined;
}

export function formatBrazilPhone(value: string) {
  const national = nationalDigitsForDisplay(value);
  if (national === undefined) return undefined;
  if (!national) return "";
  if (national.length <= 2) return `+55 (${national}`;

  const areaCode = national.slice(0, 2);
  const subscriber = national.slice(2);
  const prefixLength = national.length === 11 ? 5 : 4;
  const prefix = subscriber.slice(0, prefixLength);
  const suffix = subscriber.slice(prefixLength);
  return `+55 (${areaCode}) ${prefix}${suffix ? `-${suffix}` : ""}`;
}

function inputHasCountryCode(value: string) {
  const normalized = value.trim();
  const digits = extractPhoneDigits(normalized);
  return (
    normalized.startsWith("+") ||
    ((digits.length === 12 || digits.length === 13) && digits.startsWith("55"))
  );
}

export function countNationalDigitsBeforeCaret(value: string, caret: number) {
  const digitsBeforeCaret = extractPhoneDigits(value.slice(0, caret)).length;
  return Math.max(0, digitsBeforeCaret - (inputHasCountryCode(value) ? 2 : 0));
}

export function caretPositionForNationalDigits(
  formattedValue: string,
  nationalDigitCount: number,
) {
  if (!formattedValue || nationalDigitCount <= 0) {
    return formattedValue ? Math.min(5, formattedValue.length) : 0;
  }

  let countryDigits = 0;
  let nationalDigitsSeen = 0;
  for (let index = 0; index < formattedValue.length; index += 1) {
    if (!/\d/.test(formattedValue[index] ?? "")) continue;
    if (countryDigits < 2) {
      countryDigits += 1;
      continue;
    }
    nationalDigitsSeen += 1;
    if (nationalDigitsSeen === nationalDigitCount) return index + 1;
  }
  return formattedValue.length;
}
