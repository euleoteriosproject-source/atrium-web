import { buildLeadRecord, type ValidatedLeadPayload } from "./lead-engine.ts";
import { generatePublicCode } from "./http.ts";

export type LeadDatabaseConfig = Readonly<{
  supabaseUrl: string;
  secretKey: string;
}>;

function databaseHeaders(config: LeadDatabaseConfig) {
  return {
    apikey: config.secretKey,
    "Content-Type": "application/json",
  };
}

export async function findExistingLead(
  submissionId: string,
  config: LeadDatabaseConfig,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(
    `${config.supabaseUrl}/rest/v1/mvp_leads?submission_id=eq.${encodeURIComponent(submissionId)}&select=public_code&limit=1`,
    { headers: databaseHeaders(config) },
  );
  if (!response.ok) return undefined;
  const rows = (await response.json()) as Array<{ public_code?: string }>;
  return rows[0]?.public_code;
}

export async function persistLead(
  payload: ValidatedLeadPayload,
  config: LeadDatabaseConfig,
  fetcher: typeof fetch = fetch,
) {
  const existing = await findExistingLead(
    payload.submissionId,
    config,
    fetcher,
  );
  if (existing) return existing;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const publicCode = generatePublicCode();
    const record = buildLeadRecord(payload, publicCode);
    const response = await fetcher(`${config.supabaseUrl}/rest/v1/mvp_leads`, {
      method: "POST",
      headers: {
        ...databaseHeaders(config),
        Prefer: "return=representation",
      },
      body: JSON.stringify(record),
    });
    if (response.ok) return publicCode;

    const idempotent = await findExistingLead(
      payload.submissionId,
      config,
      fetcher,
    );
    if (idempotent) return idempotent;
    if (response.status !== 409) return undefined;
  }
  return undefined;
}
