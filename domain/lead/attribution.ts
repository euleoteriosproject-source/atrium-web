import { attributionSchema, type Attribution } from "@/domain/lead/schema";
import { leadFieldLimits } from "@/supabase/functions/_shared/lead-constraints";

export const ATTRIBUTION_SESSION_KEY = "atrium:attribution:1.0.0";

type BrowserLocation = Pick<Location, "pathname" | "search">;

function limited(value: string | null, maximum: number) {
  const normalized = value?.trim();
  return normalized && normalized.length <= maximum ? normalized : undefined;
}

function safeReferrer(value: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return limited(
      `${url.origin}${url.pathname}`,
      leadFieldLimits.attribution.referrer,
    );
  } catch {
    return undefined;
  }
}

export function readAttribution(
  location: BrowserLocation,
  referrer = "",
): Attribution {
  const params = new URLSearchParams(location.search);
  return attributionSchema.parse({
    source: limited(params.get("source"), leadFieldLimits.attribution.source),
    utmSource: limited(
      params.get("utm_source"),
      leadFieldLimits.attribution.utmSource,
    ),
    utmMedium: limited(
      params.get("utm_medium"),
      leadFieldLimits.attribution.utmMedium,
    ),
    utmCampaign: limited(
      params.get("utm_campaign"),
      leadFieldLimits.attribution.utmCampaign,
    ),
    utmContent: limited(
      params.get("utm_content"),
      leadFieldLimits.attribution.utmContent,
    ),
    utmTerm: limited(
      params.get("utm_term"),
      leadFieldLimits.attribution.utmTerm,
    ),
    referrer: safeReferrer(referrer),
    landingPage: limited(
      location.pathname,
      leadFieldLimits.attribution.landingPage,
    ),
  });
}

export function loadAttribution(
  storage: Storage | undefined = typeof window === "undefined"
    ? undefined
    : window.sessionStorage,
): Attribution | undefined {
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(ATTRIBUTION_SESSION_KEY);
    if (!raw) return undefined;
    const parsed = attributionSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) storage.removeItem(ATTRIBUTION_SESSION_KEY);
    return parsed.success ? parsed.data : undefined;
  } catch {
    storage.removeItem(ATTRIBUTION_SESSION_KEY);
    return undefined;
  }
}

export function captureInitialAttribution(
  location: BrowserLocation,
  referrer = "",
  storage: Storage | undefined = typeof window === "undefined"
    ? undefined
    : window.sessionStorage,
) {
  if (!storage) return undefined;
  const existing = loadAttribution(storage);
  if (existing) return existing;
  const attribution = readAttribution(location, referrer);
  storage.setItem(ATTRIBUTION_SESSION_KEY, JSON.stringify(attribution));
  return attribution;
}
