import type { EmailMessage, EmailProvider } from "./email-provider.ts";
import { formatBrazilPhone, normalizeBrazilPhone } from "./brazil-phone.ts";
import { leadEmailPattern } from "./lead-constraints.ts";
import {
  businessSegmentOptions,
  companySizeLabel,
  editorialTimeframeLabels,
  notificationOpportunityTitles,
  opportunityPriorityLabels,
  optionLabel,
  primaryGoalOptions,
} from "./lead-editorial-labels.ts";

export const MAX_WEBHOOK_REQUEST_BYTES = 256 * 1024;

export type LeadNotificationConfig = Readonly<{
  webhookSecret: string;
  notificationEmail: string;
  notificationFrom: string;
}>;

type NotificationLogger = Pick<Console, "info" | "error">;

type OpportunitySummary = Readonly<{
  dimension: string;
  level?: string;
  summary?: string;
}>;

export type LeadNotification = Readonly<{
  publicCode: string;
  createdAt: string;
  contactName: string;
  companyName: string;
  phone: string;
  email?: string;
  businessSegment?: string;
  companySize?: string;
  primaryGoal: string;
  leadScore: number;
  leadTier: "A" | "B" | "C" | "D";
  timeframe?: string;
  topOpportunities: readonly OpportunitySummary[];
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  landingPage?: string;
}>;

type ParseResult =
  | { success: true; data: LeadNotification }
  | { success: false; code: "INVALID_PAYLOAD" | "EVENT_NOT_ALLOWED" };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function requiredString(value: unknown, maximum: number) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maximum
    ? normalized
    : undefined;
}

function optionalString(value: unknown, maximum: number) {
  if (value === null || value === undefined || value === "") return undefined;
  return requiredString(value, maximum);
}

function parseOpportunities(value: unknown) {
  if (!Array.isArray(value) || value.length > 10) return undefined;
  const opportunities: OpportunitySummary[] = [];
  for (const item of value) {
    if (!isRecord(item)) return undefined;
    const dimension = requiredString(item.dimension, 100);
    const level = optionalString(item.level, 100);
    const summary = optionalString(item.summary, 500);
    if (!dimension) return undefined;
    opportunities.push({ dimension, level, summary });
  }
  return opportunities;
}

export function parseLeadInsertEvent(input: unknown): ParseResult {
  if (!isRecord(input)) return { success: false, code: "INVALID_PAYLOAD" };
  if (
    input.type !== "INSERT" ||
    input.schema !== "public" ||
    input.table !== "mvp_leads"
  ) {
    return { success: false, code: "EVENT_NOT_ALLOWED" };
  }
  if (input.old_record !== null || !isRecord(input.record)) {
    return { success: false, code: "INVALID_PAYLOAD" };
  }

  const record = input.record;
  const publicCode = requiredString(record.public_code, 32);
  const createdAt = requiredString(record.created_at, 64);
  const contactName = requiredString(record.contact_name, 100);
  const companyName = requiredString(record.company_name, 120);
  const phone = requiredString(record.phone, 32);
  const parsedEmail = optionalString(record.email, 254);
  const email =
    parsedEmail && leadEmailPattern.test(parsedEmail) ? parsedEmail : undefined;
  const businessSegment = optionalString(record.business_segment, 200);
  const companySize = optionalString(record.company_size, 100);
  const primaryGoal = requiredString(record.primary_goal, 100);
  const timeframe = optionalString(record.timeframe, 100);
  const topOpportunities = parseOpportunities(record.top_opportunities);
  const leadTier = record.lead_tier;
  const leadScore = record.lead_score;

  if (
    !publicCode ||
    !/^AT-[0-9]{2}-[A-Z0-9]{6}$/.test(publicCode) ||
    !createdAt ||
    !contactName ||
    !companyName ||
    !phone ||
    !primaryGoal ||
    !topOpportunities ||
    !Number.isInteger(leadScore) ||
    (leadScore as number) < 0 ||
    (leadScore as number) > 100 ||
    !["A", "B", "C", "D"].includes(String(leadTier))
  ) {
    return { success: false, code: "INVALID_PAYLOAD" };
  }

  return {
    success: true,
    data: {
      publicCode,
      createdAt,
      contactName,
      companyName,
      phone,
      email,
      businessSegment,
      companySize,
      primaryGoal,
      leadScore: leadScore as number,
      leadTier: leadTier as LeadNotification["leadTier"],
      timeframe,
      topOpportunities,
      source: optionalString(record.source, 100),
      utmSource: optionalString(record.utm_source, 200),
      utmMedium: optionalString(record.utm_medium, 200),
      utmCampaign: optionalString(record.utm_campaign, 200),
      utmContent: optionalString(record.utm_content, 200),
      utmTerm: optionalString(record.utm_term, 200),
      referrer: optionalString(record.referrer, 500),
      landingPage: optionalString(record.landing_page, 500),
    },
  };
}

const unknownLabel = "Não informado";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function subjectCompany(value: string) {
  const normalized = value.trim();
  return normalized && normalized.length <= 120 && !/[\r\n]/.test(normalized)
    ? normalized
    : undefined;
}

export function formatLeadNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não informada";

  try {
    const parts = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value;
    const day = part("day");
    const month = part("month");
    const year = part("year");
    const hour = part("hour");
    const minute = part("minute");
    return day && month && year && hour && minute
      ? `${day}/${month}/${year} às ${hour}:${minute}`
      : "Data não informada";
  } catch {
    return "Data não informada";
  }
}

function enumLabel<Value extends string>(
  labels: Readonly<Record<Value, string>>,
  value: string | undefined,
) {
  return value && Object.hasOwn(labels, value)
    ? labels[value as Value]
    : undefined;
}

function priorityDescription(label: string) {
  return `Prioridade ${label.toLocaleLowerCase("pt-BR")}`;
}

const attributionSourceLabels: Readonly<Record<string, string>> = {
  website: "Site Atrium",
  google: "Google",
  google_ads: "Google Ads",
  instagram: "Instagram",
  facebook: "Facebook",
  meta: "Meta",
  direct: "Acesso direto",
};

function sourceLabel(value: string) {
  return attributionSourceLabels[value.toLocaleLowerCase("en-US")] ?? value;
}

function isRelevantExternalReferrer(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const hostname = url.hostname.toLocaleLowerCase("en-US");
    const isLocal =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "[::1]";
    const isAtrium = /(^|[.-])atrium([.-]|$)/.test(hostname);
    return !isLocal && !isAtrium;
  } catch {
    return false;
  }
}

function attributionRows(lead: LeadNotification) {
  const rows: Array<readonly [string, string]> = [];
  if (lead.source) rows.push(["Origem", sourceLabel(lead.source)]);
  if (lead.utmSource) rows.push(["UTM source", sourceLabel(lead.utmSource)]);
  if (lead.utmMedium) rows.push(["Mídia", lead.utmMedium]);
  if (lead.utmCampaign) rows.push(["Campanha", lead.utmCampaign]);
  if (lead.utmContent) rows.push(["Conteúdo", lead.utmContent]);
  if (lead.utmTerm) rows.push(["Termo", lead.utmTerm]);
  if (lead.referrer && isRelevantExternalReferrer(lead.referrer)) {
    rows.push(["Referência", lead.referrer]);
  }
  if (rows.length > 0 && lead.landingPage) {
    rows.push(["Página de entrada", lead.landingPage]);
  }
  return rows;
}

function htmlDetailRow(label: string, value: string) {
  return `<tr><td style="padding:0 0 14px;color:#596273;font-size:12px;line-height:18px;text-transform:uppercase;letter-spacing:.08em;vertical-align:top;width:150px;">${escapeHtml(label)}</td><td style="padding:0 0 14px;color:#0B1320;font-size:15px;line-height:22px;vertical-align:top;">${escapeHtml(value)}</td></tr>`;
}

function htmlSectionTitle(value: string) {
  return `<p style="margin:0 0 16px;color:#8A6B16;font-size:12px;line-height:18px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">${escapeHtml(value)}</p>`;
}

export function buildLeadNotificationEmail(
  lead: LeadNotification,
  config: Pick<
    LeadNotificationConfig,
    "notificationEmail" | "notificationFrom"
  >,
): EmailMessage {
  const createdAt = formatLeadNotificationDate(lead.createdAt);
  const company = subjectCompany(lead.companyName);
  const canonicalPhone = normalizeBrazilPhone(lead.phone);
  const phone = canonicalPhone
    ? (formatBrazilPhone(canonicalPhone) ?? unknownLabel)
    : unknownLabel;
  const whatsappUrl = canonicalPhone
    ? `https://wa.me/${canonicalPhone}`
    : undefined;
  const email =
    lead.email && leadEmailPattern.test(lead.email) ? lead.email : undefined;
  const businessSegment =
    optionLabel(businessSegmentOptions, lead.businessSegment) ?? unknownLabel;
  const teamSize = companySizeLabel(lead.companySize);
  const companyContext = [businessSegment, teamSize]
    .filter((value): value is string => Boolean(value))
    .join(" • ");
  const primaryGoal =
    optionLabel(primaryGoalOptions, lead.primaryGoal) ?? unknownLabel;
  const timeframe =
    enumLabel(editorialTimeframeLabels, lead.timeframe) ?? unknownLabel;
  const opportunities = lead.topOpportunities.slice(0, 3).map((opportunity) => {
    const title =
      enumLabel(notificationOpportunityTitles, opportunity.dimension) ??
      "Oportunidade identificada";
    const priority =
      enumLabel(opportunityPriorityLabels, opportunity.level) ??
      "Não informada";
    return { title, priority, summary: opportunity.summary };
  });
  const attribution = attributionRows(lead);
  const subject = company
    ? `[Atrium] Novo lead ${lead.leadTier} — ${company} — ${lead.publicCode}`
    : `[Atrium] Novo lead ${lead.leadTier} — ${lead.publicCode}`;
  const textOpportunities = opportunities.length
    ? opportunities.flatMap((opportunity, index) => [
        `${index + 1}. ${opportunity.title} — ${opportunity.priority}`,
        ...(opportunity.summary ? [`   ${opportunity.summary}`] : []),
      ])
    : ["Nenhuma oportunidade priorizada."];
  const textAttribution = attribution.length
    ? [
        "",
        "ORIGEM",
        ...attribution.map(([label, value]) => `${label}: ${value}`),
      ]
    : [];
  const text = [
    "NOVO LEAD ATRIUM",
    "",
    `Código: ${lead.publicCode}`,
    `Recebido: ${createdAt}`,
    "",
    "CONTATO",
    lead.contactName,
    lead.companyName,
    ...(companyContext ? [companyContext] : []),
    "",
    `WhatsApp: ${phone}`,
    ...(email ? [`E-mail: ${email}`] : []),
    ...(whatsappUrl ? [`Falar no WhatsApp: ${whatsappUrl}`] : []),
    "",
    "OBJETIVO",
    primaryGoal,
    "",
    "MOMENTO",
    timeframe,
    "",
    "QUALIFICAÇÃO",
    `Tier ${lead.leadTier} • ${lead.leadScore}/100`,
    "",
    "OPORTUNIDADES",
    ...textOpportunities,
    ...textAttribution,
    "",
    "PRÓXIMA AÇÃO",
    "Este lead está como NOVO.",
    "Faça o primeiro contato com este lead.",
  ].join("\n");

  const htmlOpportunities = opportunities.length
    ? opportunities
        .map(
          (opportunity, index) => `
            <tr>
              <td style="padding:0 14px 18px 0;color:#D4AF37;font-size:13px;font-weight:700;line-height:20px;vertical-align:top;width:28px;">${String(index + 1).padStart(2, "0")}</td>
              <td style="padding:0 0 18px;vertical-align:top;">
                <p style="margin:0;color:#0B1320;font-size:16px;font-weight:700;line-height:23px;">${escapeHtml(opportunity.title)}</p>
                <p style="margin:3px 0 0;color:#596273;font-size:14px;line-height:21px;">${escapeHtml(priorityDescription(opportunity.priority))}</p>
                ${opportunity.summary ? `<p style="margin:6px 0 0;color:#596273;font-size:14px;line-height:21px;">${escapeHtml(opportunity.summary)}</p>` : ""}
              </td>
            </tr>`,
        )
        .join("")
    : `<tr><td style="color:#596273;font-size:14px;line-height:21px;">Nenhuma oportunidade priorizada.</td></tr>`;
  const htmlAttribution = attribution.length
    ? `<tr><td style="padding:28px 32px;border-top:1px solid #E3E0D8;">${htmlSectionTitle("Origem")}<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${attribution.map(([label, value]) => htmlDetailRow(label, value)).join("")}</table></td></tr>`
    : "";
  const tierHighlighted = lead.leadTier === "A" || lead.leadTier === "B";
  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#F8F7F3;color:#0B1320;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#F8F7F3;">
      <tr><td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;background:#FFFFFF;border:1px solid #E3E0D8;">
          <tr><td style="padding:28px 32px;background:#0B1320;">
            <p style="margin:0 0 6px;color:#D4AF37;font-size:13px;font-weight:700;letter-spacing:.16em;">ATRIUM</p>
            <p style="margin:0;color:#F8F7F3;font-size:12px;font-weight:700;letter-spacing:.12em;">NOVO LEAD</p>
          </td></tr>
          <tr><td style="padding:30px 32px;">
            <p style="margin:0;color:#0B1320;font-size:24px;font-weight:700;line-height:31px;">${escapeHtml(lead.publicCode)}</p>
            <p style="margin:7px 0 0;color:#596273;font-size:14px;line-height:21px;">Recebido em ${escapeHtml(createdAt)}</p>
          </td></tr>
          <tr><td style="padding:0 32px 30px;">
            <p style="margin:0;color:#0B1320;font-size:22px;font-weight:700;line-height:29px;">${escapeHtml(lead.contactName)}</p>
            <p style="margin:3px 0 0;color:#0B1320;font-size:17px;line-height:24px;">${escapeHtml(lead.companyName)}</p>
            ${companyContext ? `<p style="margin:10px 0 0;color:#596273;font-size:14px;line-height:21px;">${escapeHtml(companyContext)}</p>` : ""}
          </td></tr>
          <tr><td style="padding:28px 32px;border-top:1px solid #E3E0D8;">
            ${htmlSectionTitle("Contato")}
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              ${htmlDetailRow("WhatsApp", phone)}
              ${email ? htmlDetailRow("E-mail", email) : ""}
            </table>
            ${whatsappUrl ? `<a href="${whatsappUrl}" style="display:inline-block;margin-top:4px;padding:12px 18px;background:#D4AF37;border:1px solid #D4AF37;color:#0B1320;font-size:14px;font-weight:700;line-height:20px;text-decoration:none;">Falar no WhatsApp</a>` : ""}
            ${email ? `<p style="margin:14px 0 0;font-size:13px;line-height:20px;"><a href="mailto:${encodeURIComponent(email)}" style="color:#0B1320;text-decoration:underline;">Enviar e-mail</a></p>` : ""}
          </td></tr>
          <tr><td style="padding:28px 32px;border-top:1px solid #E3E0D8;">
            ${htmlSectionTitle("Objetivo")}
            <p style="margin:0 0 24px;color:#0B1320;font-size:16px;font-weight:700;line-height:23px;">${escapeHtml(primaryGoal)}</p>
            ${htmlSectionTitle("Momento")}
            <p style="margin:0 0 24px;color:#0B1320;font-size:16px;font-weight:700;line-height:23px;">${escapeHtml(timeframe)}</p>
            ${htmlSectionTitle("Qualificação")}
            <span style="display:inline-block;padding:8px 12px;background:${tierHighlighted ? "#D4AF37" : "#EEF0F2"};color:#0B1320;font-size:14px;font-weight:700;line-height:20px;">Tier ${lead.leadTier}</span>
            <span style="display:inline-block;margin-left:8px;color:#0B1320;font-size:16px;font-weight:700;line-height:36px;">${lead.leadScore}/100</span>
          </td></tr>
          <tr><td style="padding:28px 32px;border-top:1px solid #E3E0D8;">
            ${htmlSectionTitle("Principais oportunidades")}
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${htmlOpportunities}</table>
          </td></tr>
          ${htmlAttribution}
          <tr><td style="padding:28px 32px;border-top:1px solid #E3E0D8;background:#0B1320;">
            <p style="margin:0 0 8px;color:#D4AF37;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Próxima ação</p>
            <p style="margin:0;color:#F8F7F3;font-size:15px;font-weight:700;line-height:22px;">Este lead está como NOVO.</p>
            <p style="margin:5px 0 0;color:#D8DCE3;font-size:14px;line-height:21px;">Faça o primeiro contato com este lead.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return {
    from: config.notificationFrom,
    to: config.notificationEmail,
    subject,
    idempotencyKey: `atrium-lead-${lead.publicCode}`,
    html,
    text,
  };
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function handleLeadNotification(
  request: Request,
  config: LeadNotificationConfig | undefined,
  provider: EmailProvider | undefined,
  logger: NotificationLogger = console,
) {
  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      headers: { Allow: "POST", "Cache-Control": "no-store" },
    });
  }
  if (!config || !provider) {
    return jsonResponse(503, { success: false, code: "SERVICE_UNAVAILABLE" });
  }

  const suppliedSecret = request.headers.get("x-atrium-webhook-secret");
  if (!suppliedSecret || suppliedSecret !== config.webhookSecret) {
    return jsonResponse(401, { success: false, code: "UNAUTHORIZED" });
  }

  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  if (contentLength > MAX_WEBHOOK_REQUEST_BYTES) {
    return jsonResponse(413, { success: false, code: "REQUEST_TOO_LARGE" });
  }

  let input: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_WEBHOOK_REQUEST_BYTES) {
      return jsonResponse(413, { success: false, code: "REQUEST_TOO_LARGE" });
    }
    input = JSON.parse(raw);
  } catch {
    return jsonResponse(400, { success: false, code: "INVALID_PAYLOAD" });
  }

  const parsed = parseLeadInsertEvent(input);
  if (!parsed.success) {
    return jsonResponse(400, { success: false, code: parsed.code });
  }

  const result = await provider.send(
    buildLeadNotificationEmail(parsed.data, config),
  );
  const logDetails = {
    publicCode: parsed.data.publicCode,
    success: result.success,
    providerStatus: result.status,
    technicalCode: result.code,
  };
  if (!result.success) {
    logger.error("[notify-new-lead] notification-result", logDetails);
    return jsonResponse(502, {
      success: false,
      code: "NOTIFICATION_FAILED",
    });
  }

  logger.info("[notify-new-lead] notification-result", logDetails);
  return jsonResponse(200, { success: true });
}
