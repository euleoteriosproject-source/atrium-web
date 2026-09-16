export type TurnstileVerificationConfig = Readonly<{
  secret: string;
  testMode?: boolean;
  expectedAction?: string;
  expectedHostname?: string;
}>;

export const DEFAULT_TURNSTILE_ACTION = "create_lead";

export function resolveExpectedTurnstileAction(value?: string) {
  return value?.trim() || DEFAULT_TURNSTILE_ACTION;
}

export function parseTurnstileTestMode(value?: string) {
  return value?.trim() === "true";
}

export async function verifyTurnstile(
  token: string,
  submissionId: string,
  config: TurnstileVerificationConfig,
  fetcher: typeof fetch = fetch,
) {
  const expectedAction = resolveExpectedTurnstileAction(config.expectedAction);
  const body = new URLSearchParams({
    secret: config.secret,
    response: token,
    idempotency_key: submissionId,
  });
  const response = await fetcher(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body },
  );
  if (!response.ok) return false;
  const result = (await response.json()) as {
    success?: boolean;
    action?: string;
    hostname?: string;
  };
  if (!result.success) return false;
  if (config.testMode) return true;
  if (result.action !== expectedAction) return false;
  return (
    !config.expectedHostname || result.hostname === config.expectedHostname
  );
}
