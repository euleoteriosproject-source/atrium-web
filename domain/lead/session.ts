import { z } from "zod";

import { timeframeSchema } from "@/domain/lead/schema";

export const LEAD_HANDOFF_SESSION_KEY = "atrium:lead-handoff:1.0.0";
export const LEAD_SUBMISSION_SESSION_KEY = "atrium:lead-submission:1.0.0";

const leadSubmissionSessionSchema = z.object({
  submissionId: z.string().uuid(),
  diagnosticStartedAt: z.string().min(1).max(64),
});

const leadHandoffSchema = z.object({
  version: z.literal("1.0.0"),
  submissionId: z.string().uuid(),
  companyName: z.string().min(1).max(120),
  timeframe: timeframeSchema.nullable(),
  publicCode: z
    .string()
    .regex(/^AT-[0-9]{2}-[A-Z0-9]{6}$/)
    .nullable(),
  persisted: z.boolean(),
  createdAt: z.string().min(1),
});

export type LeadHandoff = z.infer<typeof leadHandoffSchema>;

function browserStorage() {
  return typeof window === "undefined" ? undefined : window.sessionStorage;
}

export function getOrCreateLeadSubmissionId(
  diagnosticStartedAt: string,
  storage: Storage | undefined = browserStorage(),
) {
  if (!storage) return crypto.randomUUID();
  try {
    const existing = leadSubmissionSessionSchema.safeParse(
      JSON.parse(storage.getItem(LEAD_SUBMISSION_SESSION_KEY) ?? "null"),
    );
    if (
      existing.success &&
      existing.data.diagnosticStartedAt === diagnosticStartedAt
    ) {
      return existing.data.submissionId;
    }
  } catch {
    // Replace invalid session data below.
  }

  const submissionId = crypto.randomUUID();
  storage.setItem(
    LEAD_SUBMISSION_SESSION_KEY,
    JSON.stringify({ submissionId, diagnosticStartedAt }),
  );
  return submissionId;
}

export function loadLeadHandoff(
  storage: Storage | undefined = browserStorage(),
): LeadHandoff | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(LEAD_HANDOFF_SESSION_KEY);
    if (!raw) return null;
    const parsed = leadHandoffSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) storage.removeItem(LEAD_HANDOFF_SESSION_KEY);
    return parsed.success ? parsed.data : null;
  } catch {
    storage.removeItem(LEAD_HANDOFF_SESSION_KEY);
    return null;
  }
}

export function saveLeadHandoff(
  handoff: LeadHandoff,
  storage: Storage | undefined = browserStorage(),
) {
  if (!storage) return;
  storage.setItem(
    LEAD_HANDOFF_SESSION_KEY,
    JSON.stringify(leadHandoffSchema.parse(handoff)),
  );
}

export function clearLeadHandoff(
  storage: Storage | undefined = browserStorage(),
) {
  storage?.removeItem(LEAD_HANDOFF_SESSION_KEY);
}
