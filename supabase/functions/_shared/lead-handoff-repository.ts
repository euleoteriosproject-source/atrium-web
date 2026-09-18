export type LeadHandoffDatabaseConfig = Readonly<{
  supabaseUrl: string;
  secretKey: string;
}>;

export async function recordLeadHandoff(
  submissionId: string,
  publicCode: string,
  config: LeadHandoffDatabaseConfig,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(
    `${config.supabaseUrl}/rest/v1/rpc/track_mvp_lead_handoff`,
    {
      method: "POST",
      headers: {
        apikey: config.secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_submission_id: submissionId,
        p_public_code: publicCode,
      }),
    },
  );
  if (!response.ok) throw new Error("HANDOFF_DATABASE_UNAVAILABLE");
  return (await response.json()) === true;
}
