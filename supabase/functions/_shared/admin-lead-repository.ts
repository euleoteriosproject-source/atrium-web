import {
  adminLeadStatuses,
  type AdminLeadListItem,
  type AdminLeadStatus,
  type AdminLeadSummary,
  type AdminLeadTier,
  type AdminLeadTimeframe,
  type AdminLeadHandoffFilter,
} from "./admin-lead-types.ts";

export type AdminLeadDatabaseConfig = Readonly<{
  supabaseUrl: string;
  secretKey: string;
}>;

export type AdminLeadFilters = Readonly<{
  page: number;
  status?: AdminLeadStatus;
  tier?: AdminLeadTier;
  timeframe?: AdminLeadTimeframe;
  dateFrom?: string;
  dateTo?: string;
  query?: string;
  handoff?: AdminLeadHandoffFilter;
}>;

export type AdminLeadDetailRecord = Record<string, unknown>;

const listColumns = [
  "public_code",
  "created_at",
  "company_name",
  "contact_name",
  "phone",
  "status",
  "lead_tier",
  "lead_score",
  "timeframe",
  "primary_goal",
  "whatsapp_handoff_at",
  "last_contact_at",
  "next_follow_up_at",
].join(",");

const detailColumns = [
  "id",
  ...listColumns.split(","),
  "status_updated_at",
  "email",
  "business_segment",
  "company_size",
  "additional_goals",
  "answers_json",
  "top_opportunities",
  "budget_range",
  "source",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "referrer",
  "landing_page",
  "consent_contact",
  "consent_at",
].join(",");

const activityColumns = [
  "activity_type",
  "created_at",
  "from_status",
  "to_status",
  "note",
  "follow_up_at",
].join(",");

function headers(config: AdminLeadDatabaseConfig) {
  return { apikey: config.secretKey };
}

function applyFilters(params: URLSearchParams, filters: AdminLeadFilters) {
  if (filters.status) params.set("status", `eq.${filters.status}`);
  if (filters.tier) params.set("lead_tier", `eq.${filters.tier}`);
  if (filters.timeframe) params.set("timeframe", `eq.${filters.timeframe}`);
  if (filters.dateFrom) {
    params.set("created_at", `gte.${filters.dateFrom}T00:00:00.000Z`);
  }
  if (filters.dateTo) {
    const exclusive = new Date(`${filters.dateTo}T00:00:00.000Z`);
    exclusive.setUTCDate(exclusive.getUTCDate() + 1);
    params.append("created_at", `lt.${exclusive.toISOString()}`);
  }
  if (filters.query) {
    const pattern = `*${filters.query}*`;
    params.set(
      "or",
      `(public_code.ilike.${pattern},company_name.ilike.${pattern},contact_name.ilike.${pattern},phone.ilike.${pattern})`,
    );
  }
  if (filters.handoff === "OPENED") {
    params.set("whatsapp_handoff_at", "not.is.null");
  }
  if (filters.handoff === "NOT_OPENED") {
    params.set("whatsapp_handoff_at", "is.null");
  }
}

function parseTotal(response: Response) {
  const contentRange = response.headers.get("Content-Range") ?? "";
  const total = Number(contentRange.split("/")[1]);
  return Number.isInteger(total) && total >= 0 ? total : 0;
}

function listItem(record: Record<string, unknown>): AdminLeadListItem {
  return {
    publicCode: String(record.public_code),
    createdAt: String(record.created_at),
    companyName: String(record.company_name),
    contactName: String(record.contact_name),
    phone: String(record.phone),
    status: record.status as AdminLeadStatus,
    leadTier: record.lead_tier as AdminLeadTier,
    leadScore: Number(record.lead_score),
    timeframe: (record.timeframe as AdminLeadTimeframe | null) ?? null,
    primaryGoal: String(record.primary_goal),
    whatsappHandoffAt: (record.whatsapp_handoff_at as string | null) ?? null,
    lastContactAt: (record.last_contact_at as string | null) ?? null,
    nextFollowUpAt: (record.next_follow_up_at as string | null) ?? null,
  };
}

export async function findAdminLeadActivities(
  leadId: string,
  config: AdminLeadDatabaseConfig,
  fetcher: typeof fetch = fetch,
) {
  const params = new URLSearchParams({
    lead_id: `eq.${leadId}`,
    select: activityColumns,
    order: "created_at.desc,id.desc",
  });
  const response = await fetcher(
    `${config.supabaseUrl}/rest/v1/mvp_lead_activities?${params.toString()}`,
    { headers: headers(config) },
  );
  if (!response.ok) throw new Error("ADMIN_DATABASE_UNAVAILABLE");
  return (await response.json()) as Record<string, unknown>[];
}

async function countLeads(
  config: AdminLeadDatabaseConfig,
  status: AdminLeadStatus | undefined,
  fetcher: typeof fetch,
) {
  const params = new URLSearchParams({ select: "public_code", limit: "1" });
  if (status) params.set("status", `eq.${status}`);
  const response = await fetcher(
    `${config.supabaseUrl}/rest/v1/mvp_leads?${params.toString()}`,
    {
      method: "HEAD",
      headers: { ...headers(config), Prefer: "count=exact" },
    },
  );
  if (!response.ok) throw new Error("ADMIN_DATABASE_UNAVAILABLE");
  return parseTotal(response);
}

export async function getAdminLeadSummary(
  config: AdminLeadDatabaseConfig,
  fetcher: typeof fetch = fetch,
): Promise<AdminLeadSummary> {
  const [total, ...counts] = await Promise.all([
    countLeads(config, undefined, fetcher),
    ...adminLeadStatuses.map((status) => countLeads(config, status, fetcher)),
  ]);
  return {
    total,
    byStatus: Object.fromEntries(
      adminLeadStatuses.map((status, index) => [status, counts[index] ?? 0]),
    ) as Record<AdminLeadStatus, number>,
  };
}

export async function listAdminLeads(
  filters: AdminLeadFilters,
  config: AdminLeadDatabaseConfig,
  fetcher: typeof fetch = fetch,
) {
  const pageSize = 25 as const;
  const start = (filters.page - 1) * pageSize;
  const params = new URLSearchParams({
    select: listColumns,
    order: "created_at.desc",
  });
  applyFilters(params, filters);
  const response = await fetcher(
    `${config.supabaseUrl}/rest/v1/mvp_leads?${params.toString()}`,
    {
      headers: {
        ...headers(config),
        Prefer: "count=exact",
        Range: `${start}-${start + pageSize - 1}`,
      },
    },
  );
  if (!response.ok) throw new Error("ADMIN_DATABASE_UNAVAILABLE");
  const records = (await response.json()) as Record<string, unknown>[];
  const total = parseTotal(response);
  return {
    items: records.map(listItem),
    pagination: {
      page: filters.page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function findAdminLead(
  publicCode: string,
  config: AdminLeadDatabaseConfig,
  fetcher: typeof fetch = fetch,
): Promise<AdminLeadDetailRecord | undefined> {
  const params = new URLSearchParams({
    public_code: `eq.${publicCode}`,
    select: detailColumns,
    limit: "1",
  });
  const response = await fetcher(
    `${config.supabaseUrl}/rest/v1/mvp_leads?${params.toString()}`,
    { headers: headers(config) },
  );
  if (!response.ok) throw new Error("ADMIN_DATABASE_UNAVAILABLE");
  const records = (await response.json()) as AdminLeadDetailRecord[];
  return records[0];
}
