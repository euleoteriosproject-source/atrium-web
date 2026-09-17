import { createResendEmailProvider } from "../_shared/email-provider.ts";
import {
  handleLeadNotification,
  type LeadNotificationConfig,
} from "../_shared/lead-notification.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

function environmentValue(name: string) {
  const value = Deno.env.get(name)?.trim();
  return value || undefined;
}

const webhookSecret = environmentValue("LEAD_WEBHOOK_SECRET");
const notificationEmail = environmentValue("LEAD_NOTIFICATION_EMAIL");
const notificationFrom = environmentValue("LEAD_NOTIFICATION_FROM");
const providerApiKey = environmentValue("LEAD_NOTIFICATION_PROVIDER_API_KEY");

const config: LeadNotificationConfig | undefined =
  webhookSecret && notificationEmail && notificationFrom
    ? { webhookSecret, notificationEmail, notificationFrom }
    : undefined;
const provider = providerApiKey
  ? createResendEmailProvider(providerApiKey)
  : undefined;

Deno.serve((request) => handleLeadNotification(request, config, provider));
