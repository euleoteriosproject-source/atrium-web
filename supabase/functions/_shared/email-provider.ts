export type EmailMessage = Readonly<{
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}>;

export type EmailDeliveryResult = Readonly<{
  success: boolean;
  status: number | null;
  code: string | null;
}>;

export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailDeliveryResult>;
}

const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";

function sanitizeProviderCode(value: unknown) {
  return typeof value === "string" && /^[a-z0-9_.:-]{1,64}$/i.test(value)
    ? value
    : null;
}

export function createResendEmailProvider(
  apiKey: string,
  fetcher: typeof fetch = fetch,
): EmailProvider {
  return {
    async send(message) {
      try {
        const response = await fetcher(RESEND_EMAIL_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": message.idempotencyKey,
          },
          body: JSON.stringify({
            from: message.from,
            to: [message.to],
            subject: message.subject,
            html: message.html,
            text: message.text,
          }),
        });

        let code: string | null = null;
        if (!response.ok) {
          try {
            const body = (await response.json()) as {
              code?: unknown;
              name?: unknown;
            };
            code =
              sanitizeProviderCode(body.code) ??
              sanitizeProviderCode(body.name) ??
              "PROVIDER_REJECTED";
          } catch {
            code = "PROVIDER_REJECTED";
          }
        }

        return { success: response.ok, status: response.status, code };
      } catch {
        return { success: false, status: null, code: "REQUEST_FAILED" };
      }
    },
  };
}
