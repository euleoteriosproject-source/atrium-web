import {
  findAdminLead,
  findAdminLeadActivities,
  getAdminLeadSummary,
  listAdminLeads,
  type AdminLeadDatabaseConfig,
  type AdminLeadFilters,
} from "./admin-lead-repository.ts";
import {
  adminLeadStatuses,
  adminLeadStatusLabels,
  adminLeadTiers,
  adminLeadTimeframes,
  type AdminLeadDetail,
  type AdminLeadActivity,
  type AdminLeadActivityType,
  type AdminLeadStatus,
  type AdminLeadTier,
} from "./admin-lead-types.ts";
import {
  businessSegmentOptions,
  companySizeLabel,
  editorialOpportunityDimensionLabels,
  editorialTimeframeLabels,
  notificationOpportunityTitles,
  opportunityPriorityLabels,
  optionLabel,
  primaryGoalOptions,
} from "./lead-editorial-labels.ts";
import { buildLeadOutreachWhatsAppUrl } from "./lead-outreach-whatsapp.ts";
import { isOriginAllowed, parseAllowedOrigins } from "./http.ts";

export type AdminLeadsConfig = AdminLeadDatabaseConfig &
  Readonly<{
    publishableKey: string;
    adminUserIds: readonly string[];
    allowedOrigins: readonly string[];
  }>;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const publicCodePattern = /^AT-[0-9]{2}-[A-Z0-9]{6}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const safeSearchPattern = /^[\p{L}\p{N}\s+.-]+$/u;

const budgetLabels: Record<string, string> = {
  UNDERSTANDING: "Ainda estou entendendo",
  UP_TO_3000: "Até R$ 3.000",
  FROM_3000_TO_7500: "R$ 3.000–7.500",
  FROM_7500_TO_15000: "R$ 7.500–15.000",
  FROM_15000_TO_30000: "R$ 15.000–30.000",
  ABOVE_30000: "Acima de R$ 30.000",
};

const diagnosticHighlights = [
  {
    questionId: "Q004",
    label: "Canais de aquisição",
    options: {
      WHATSAPP: "WhatsApp",
      INSTAGRAM: "Instagram",
      GOOGLE: "Google",
      WEBSITE: "Site",
      REFERRAL: "Indicação",
      PHONE: "Telefone",
      MARKETPLACE: "Marketplace",
      SALES_TEAM: "Equipe comercial",
      OTHER: "Outro",
    },
  },
  {
    questionId: "Q005",
    label: "Ferramentas da rotina",
    options: {
      WHATSAPP: "WhatsApp",
      SPREADSHEET: "Excel / Google Sheets",
      EMAIL: "E-mail",
      CRM: "CRM",
      ERP: "ERP",
      CUSTOM_SYSTEM: "Sistema próprio",
      WORK_MANAGEMENT: "Trello / Notion / similares",
      FORMS: "Google Forms / formulários",
      OTHER: "Outro",
    },
  },
] as const;

const sourceLabels: Readonly<Record<string, string>> = {
  website: "Site Atrium",
  google: "Google",
  google_ads: "Google Ads",
  instagram: "Instagram",
  facebook: "Facebook",
  meta: "Meta",
  direct: "Acesso direto",
};

function sourceLabel(value: string) {
  return sourceLabels[value.toLocaleLowerCase("en-US")] ?? value;
}

export function parseAdminUserIds(value: string | undefined) {
  return [...new Set((value ?? "").split(",").map((id) => id.trim()))].filter(
    (id) => uuidPattern.test(id),
  );
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function response(
  origin: string,
  status: number,
  body: Record<string, unknown>,
) {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders(origin),
      "Cache-Control": "no-store",
    },
  });
}

function bearerToken(request: Request) {
  const value = request.headers.get("Authorization") ?? "";
  const match = /^Bearer\s+([^\s]+)$/i.exec(value);
  return match?.[1];
}

async function authenticatedUserId(
  token: string,
  config: AdminLeadsConfig,
  fetcher: typeof fetch,
) {
  const authResponse = await fetcher(`${config.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!authResponse.ok) return undefined;
  const user = (await authResponse.json()) as { id?: unknown };
  return typeof user.id === "string" && uuidPattern.test(user.id)
    ? user.id
    : undefined;
}

function exactDate(value: string | null) {
  if (!value) return undefined;
  if (!datePattern.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
    ? value
    : null;
}

function parseFilters(url: URL): AdminLeadFilters | undefined {
  const rawPage = url.searchParams.get("page") ?? "1";
  const page = Number(rawPage);
  if (!Number.isInteger(page) || page < 1 || page > 10000) return undefined;

  const rawStatus = url.searchParams.get("status");
  const status = rawStatus
    ? adminLeadStatuses.find((value) => value === rawStatus)
    : undefined;
  if (rawStatus && !status) return undefined;

  const rawTier = url.searchParams.get("tier");
  const tier = rawTier
    ? adminLeadTiers.find((value) => value === rawTier)
    : undefined;
  if (rawTier && !tier) return undefined;

  const rawTimeframe = url.searchParams.get("timeframe");
  const timeframe = rawTimeframe
    ? adminLeadTimeframes.find((value) => value === rawTimeframe)
    : undefined;
  if (rawTimeframe && !timeframe) return undefined;

  const dateFrom = exactDate(url.searchParams.get("dateFrom"));
  const dateTo = exactDate(url.searchParams.get("dateTo"));
  if (
    dateFrom === null ||
    dateTo === null ||
    (dateFrom && dateTo && dateFrom > dateTo)
  ) {
    return undefined;
  }

  const query = url.searchParams.get("query")?.trim() || undefined;
  if (query && (query.length > 80 || !safeSearchPattern.test(query))) {
    return undefined;
  }
  const rawHandoff = url.searchParams.get("handoff");
  const handoff =
    rawHandoff === "OPENED" || rawHandoff === "NOT_OPENED"
      ? rawHandoff
      : undefined;
  if (rawHandoff && !handoff) return undefined;
  return { page, status, tier, timeframe, dateFrom, dateTo, query, handoff };
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function relevantExternalReferrer(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLocaleLowerCase("en-US");
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !["localhost", "127.0.0.1", "::1"].includes(hostname) &&
      !/(^|[.-])atrium([.-]|$)/.test(hostname)
    );
  } catch {
    return false;
  }
}

function attribution(record: Record<string, unknown>) {
  const rows: Array<{ label: string; value: string }> = [];
  const fields = [
    ["Origem", "source"],
    ["UTM source", "utm_source"],
    ["Mídia", "utm_medium"],
    ["Campanha", "utm_campaign"],
    ["Conteúdo", "utm_content"],
    ["Termo", "utm_term"],
  ] as const;
  for (const [label, field] of fields) {
    const value = optionalString(record[field]);
    if (value) {
      rows.push({
        label,
        value:
          field === "source" || field === "utm_source"
            ? sourceLabel(value)
            : value,
      });
    }
  }
  const referrer = optionalString(record.referrer);
  if (referrer && relevantExternalReferrer(referrer)) {
    rows.push({ label: "Referência", value: referrer });
  }
  const landingPage = optionalString(record.landing_page);
  if (rows.length > 0 && landingPage) {
    rows.push({ label: "Página de entrada", value: landingPage });
  }
  return rows;
}

function opportunities(value: unknown): AdminLeadDetail["opportunities"] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 3).flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const dimension = optionalString(item.dimension);
    const level = optionalString(item.level);
    if (!dimension || !level) return [];
    const title =
      notificationOpportunityTitles[
        dimension as keyof typeof notificationOpportunityTitles
      ] ??
      editorialOpportunityDimensionLabels[
        dimension as keyof typeof editorialOpportunityDimensionLabels
      ];
    const priority =
      opportunityPriorityLabels[
        level as keyof typeof opportunityPriorityLabels
      ];
    if (!title || !priority) return [];
    return [
      {
        title,
        priority,
        summary: optionalString(item.summary) ?? null,
      },
    ];
  });
}

function humanizedDiagnostic(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const answers = value as Record<string, unknown>;
  return diagnosticHighlights.flatMap((highlight) => {
    const answer = answers[highlight.questionId];
    const values = Array.isArray(answer) ? answer : [answer];
    const labels = values.flatMap((item) => {
      if (typeof item !== "string") return [];
      const label = (highlight.options as Record<string, string>)[item];
      return label ? [label] : [];
    });
    return labels.length ? [{ label: highlight.label, values: labels }] : [];
  });
}

function activityDate(value: unknown) {
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function activities(records: Record<string, unknown>[]): AdminLeadActivity[] {
  return records.flatMap((record) => {
    const type = optionalString(record.activity_type) as
      AdminLeadActivityType | undefined;
    const createdAt = optionalString(record.created_at);
    if (!type || !createdAt) return [];
    let label: string;
    let detail: string | null = null;
    if (type === "LEAD_CREATED") label = "Lead criado";
    else if (type === "WHATSAPP_HANDOFF") {
      label = "Visitante abriu WhatsApp após o diagnóstico";
    } else if (type === "STATUS_CHANGED") {
      label = "Status alterado";
      const from = adminLeadStatusLabels[record.from_status as AdminLeadStatus];
      const to = adminLeadStatusLabels[record.to_status as AdminLeadStatus];
      detail = from && to ? `${from} → ${to}` : null;
    } else if (type === "CONTACT_RECORDED") label = "Contato registrado";
    else if (type === "NOTE_ADDED") label = "Observação adicionada";
    else if (type === "FOLLOW_UP_SET") {
      label = "Follow-up definido";
      const date = activityDate(record.follow_up_at);
      detail = date ? `Para ${date}` : null;
    } else if (type === "FOLLOW_UP_CLEARED") {
      label = "Follow-up removido";
    } else return [];
    return [
      {
        type,
        createdAt,
        label,
        detail,
        note:
          type === "NOTE_ADDED" ? (optionalString(record.note) ?? null) : null,
      },
    ];
  });
}

function detail(
  record: Record<string, unknown>,
  activityRecords: Record<string, unknown>[],
): AdminLeadDetail {
  const primaryGoalValue = String(record.primary_goal);
  const timeframeValue = optionalString(record.timeframe);
  const topOpportunities = Array.isArray(record.top_opportunities)
    ? (record.top_opportunities as Array<Record<string, unknown>>)
    : [];
  return {
    publicCode: String(record.public_code),
    createdAt: String(record.created_at),
    status: record.status as AdminLeadStatus,
    statusUpdatedAt: String(record.status_updated_at),
    whatsappHandoffAt: optionalString(record.whatsapp_handoff_at) ?? null,
    lastContactAt: optionalString(record.last_contact_at) ?? null,
    nextFollowUpAt: optionalString(record.next_follow_up_at) ?? null,
    outreachWhatsAppUrl:
      buildLeadOutreachWhatsAppUrl({
        contactName: optionalString(record.contact_name),
        phone: String(record.phone),
        primaryGoal: primaryGoalValue,
        timeframe: timeframeValue,
        topOpportunities: topOpportunities.map((item) => ({
          dimension: optionalString(item.dimension),
          title: optionalString(item.title),
        })),
      }) ?? null,
    contact: {
      name: String(record.contact_name),
      company: String(record.company_name),
      phone: String(record.phone),
      email: optionalString(record.email) ?? null,
    },
    profile: {
      businessSegment:
        optionLabel(
          businessSegmentOptions,
          optionalString(record.business_segment),
        ) ?? null,
      companySize:
        companySizeLabel(optionalString(record.company_size)) ?? null,
      primaryGoal:
        optionLabel(primaryGoalOptions, primaryGoalValue) ?? "Não informado",
      additionalGoals: stringArray(record.additional_goals).flatMap((goal) => {
        const label = optionLabel(primaryGoalOptions, goal);
        return label ? [label] : [];
      }),
      timeframe: timeframeValue
        ? (editorialTimeframeLabels[
            timeframeValue as keyof typeof editorialTimeframeLabels
          ] ?? null)
        : null,
      budgetRange: budgetLabels[String(record.budget_range)] ?? null,
    },
    qualification: {
      score: Number(record.lead_score),
      tier: record.lead_tier as AdminLeadTier,
    },
    opportunities: opportunities(record.top_opportunities),
    diagnosticHighlights: humanizedDiagnostic(record.answers_json),
    attribution: attribution(record),
    consent: {
      contact: true,
      at: String(record.consent_at),
    },
    activities: activities(activityRecords),
  };
}

export async function handleAdminLeads(
  request: Request,
  config: AdminLeadsConfig | undefined,
  fetcher: typeof fetch = fetch,
  runtimeAllowedOrigins: readonly string[] = config?.allowedOrigins ?? [],
) {
  const origin = request.headers.get("Origin");
  if (!isOriginAllowed(origin, [...runtimeAllowedOrigins])) {
    return Response.json(
      { success: false, code: "ORIGIN_NOT_ALLOWED" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
  const safeOrigin = origin as string;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(safeOrigin),
    });
  }
  if (request.method !== "GET") {
    return response(safeOrigin, 405, {
      success: false,
      code: "METHOD_NOT_ALLOWED",
    });
  }
  if (!config) {
    return response(safeOrigin, 503, {
      success: false,
      code: "SERVICE_UNAVAILABLE",
    });
  }

  const token = bearerToken(request);
  if (!token) {
    return response(safeOrigin, 401, {
      success: false,
      code: "UNAUTHENTICATED",
    });
  }

  try {
    const userId = await authenticatedUserId(token, config, fetcher);
    if (!userId) {
      return response(safeOrigin, 401, {
        success: false,
        code: "UNAUTHENTICATED",
      });
    }
    if (!config.adminUserIds.includes(userId)) {
      return response(safeOrigin, 403, {
        success: false,
        code: "FORBIDDEN",
      });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get("action") ?? "list";
    if (action === "summary") {
      const summary = await getAdminLeadSummary(config, fetcher);
      return response(safeOrigin, 200, { success: true, summary });
    }
    if (action === "list") {
      const filters = parseFilters(url);
      if (!filters) {
        return response(safeOrigin, 400, {
          success: false,
          code: "INVALID_QUERY",
        });
      }
      const [result, summary] = await Promise.all([
        listAdminLeads(filters, config, fetcher),
        getAdminLeadSummary(config, fetcher),
      ]);
      return response(safeOrigin, 200, {
        success: true,
        ...result,
        summary,
      });
    }
    if (action === "detail") {
      const publicCode = url.searchParams.get("publicCode") ?? "";
      if (!publicCodePattern.test(publicCode)) {
        return response(safeOrigin, 400, {
          success: false,
          code: "INVALID_QUERY",
        });
      }
      const record = await findAdminLead(publicCode, config, fetcher);
      if (!record) {
        return response(safeOrigin, 404, {
          success: false,
          code: "NOT_FOUND",
        });
      }
      const leadId = optionalString(record.id);
      if (!leadId) throw new Error("ADMIN_DATABASE_UNAVAILABLE");
      const activityRecords = await findAdminLeadActivities(
        leadId,
        config,
        fetcher,
      );
      return response(safeOrigin, 200, {
        success: true,
        lead: detail(record, activityRecords),
      });
    }
    return response(safeOrigin, 400, {
      success: false,
      code: "INVALID_QUERY",
    });
  } catch {
    return response(safeOrigin, 503, {
      success: false,
      code: "SERVICE_UNAVAILABLE",
    });
  }
}

export function adminAllowedOrigins(value: string | undefined) {
  return parseAllowedOrigins(value);
}
