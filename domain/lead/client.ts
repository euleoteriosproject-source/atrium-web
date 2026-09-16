import {
  createLeadResponseSchema,
  type CreateLeadResponse,
  type LeadSubmission,
} from "@/domain/lead/schema";

export type LeadEndpointConfig = Readonly<{
  supabaseUrl?: string;
  publishableKey?: string;
}>;

export class LeadSubmissionError extends Error {
  constructor() {
    super("Não foi possível registrar o diagnóstico.");
    this.name = "LeadSubmissionError";
  }
}

export async function createLead(
  payload: LeadSubmission,
  config: LeadEndpointConfig,
  fetcher: typeof fetch = fetch,
): Promise<CreateLeadResponse> {
  if (!config.supabaseUrl) throw new LeadSubmissionError();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.publishableKey) headers.apikey = config.publishableKey;

  try {
    const response = await fetcher(
      `${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/create-lead`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12_000),
      },
    );
    if (!response.ok) throw new LeadSubmissionError();
    const parsed = createLeadResponseSchema.safeParse(await response.json());
    if (!parsed.success) throw new LeadSubmissionError();
    return parsed.data;
  } catch (error) {
    if (error instanceof LeadSubmissionError) throw error;
    throw new LeadSubmissionError();
  }
}
