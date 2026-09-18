import type {
  AdminLeadDetailResponse,
  AdminLeadListResponse,
  AdminLeadStatus,
  AdminLeadTier,
  AdminLeadTimeframe,
  AdminLeadSummary,
  AdminLeadHandoffFilter,
} from "@/supabase/functions/_shared/admin-lead-types";
import type {
  AdminLeadActionCommand,
  AdminLeadActionResult,
} from "@/supabase/functions/_shared/admin-lead-actions-repository";

import type { AdminAuthConfig } from "./auth";

export type AdminLeadQuery = Readonly<{
  page?: number;
  status?: AdminLeadStatus | "";
  tier?: AdminLeadTier | "";
  timeframe?: AdminLeadTimeframe | "";
  dateFrom?: string;
  dateTo?: string;
  query?: string;
  handoff?: AdminLeadHandoffFilter | "";
}>;

export class AdminApiError extends Error {
  constructor(
    readonly code:
      | "UNAUTHENTICATED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "INVALID_ACTION"
      | "UNAVAILABLE",
  ) {
    super(
      code === "FORBIDDEN"
        ? "Você não tem autorização para acessar esta área."
        : code === "NOT_FOUND"
          ? "Lead não encontrado."
          : code === "UNAUTHENTICATED"
            ? "Sua sessão expirou. Entre novamente."
            : code === "INVALID_ACTION"
              ? "A ação não pôde ser concluída. Revise os dados e tente novamente."
              : "Não foi possível carregar os dados agora.",
    );
    this.name = "AdminApiError";
  }
}

function endpoint(config: AdminAuthConfig, params: URLSearchParams) {
  if (!config.supabaseUrl || !config.publishableKey) {
    throw new AdminApiError("UNAVAILABLE");
  }
  return `${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/admin-leads?${params.toString()}`;
}

function actionsEndpoint(config: AdminAuthConfig) {
  if (!config.supabaseUrl || !config.publishableKey) {
    throw new AdminApiError("UNAVAILABLE");
  }
  return `${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/admin-lead-actions`;
}

async function request<T>(
  params: URLSearchParams,
  accessToken: string,
  config: AdminAuthConfig,
  fetcher: typeof fetch,
) {
  try {
    const response = await fetcher(endpoint(config, params), {
      headers: {
        apikey: config.publishableKey as string,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.status === 401) throw new AdminApiError("UNAUTHENTICATED");
    if (response.status === 403) throw new AdminApiError("FORBIDDEN");
    if (response.status === 404) throw new AdminApiError("NOT_FOUND");
    if (!response.ok) throw new AdminApiError("UNAVAILABLE");
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof AdminApiError) throw error;
    throw new AdminApiError("UNAVAILABLE");
  }
}

export async function verifyAdminAccess(
  accessToken: string,
  config: AdminAuthConfig,
  fetcher: typeof fetch = fetch,
) {
  const result = await request<{ success: true; summary: AdminLeadSummary }>(
    new URLSearchParams({ action: "summary" }),
    accessToken,
    config,
    fetcher,
  );
  return result.summary;
}

export function getAdminLeads(
  query: AdminLeadQuery,
  accessToken: string,
  config: AdminAuthConfig,
  fetcher: typeof fetch = fetch,
) {
  const params = new URLSearchParams({
    action: "list",
    page: String(query.page ?? 1),
  });
  for (const [key, value] of Object.entries(query)) {
    if (key !== "page" && value) params.set(key, String(value));
  }
  return request<AdminLeadListResponse>(params, accessToken, config, fetcher);
}

export function getAdminLead(
  publicCode: string,
  accessToken: string,
  config: AdminAuthConfig,
  fetcher: typeof fetch = fetch,
) {
  return request<AdminLeadDetailResponse>(
    new URLSearchParams({ action: "detail", publicCode }),
    accessToken,
    config,
    fetcher,
  );
}

export async function runAdminLeadAction(
  command: AdminLeadActionCommand,
  accessToken: string,
  config: AdminAuthConfig,
  fetcher: typeof fetch = fetch,
) {
  try {
    const response = await fetcher(actionsEndpoint(config), {
      method: "POST",
      headers: {
        apikey: config.publishableKey as string,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });
    if (response.status === 401) throw new AdminApiError("UNAUTHENTICATED");
    if (response.status === 403) throw new AdminApiError("FORBIDDEN");
    if (response.status === 404) throw new AdminApiError("NOT_FOUND");
    if (response.status === 400 || response.status === 409) {
      throw new AdminApiError("INVALID_ACTION");
    }
    if (!response.ok) throw new AdminApiError("UNAVAILABLE");
    return (await response.json()) as Readonly<{
      success: true;
      lead: AdminLeadActionResult;
    }>;
  } catch (error) {
    if (error instanceof AdminApiError) throw error;
    throw new AdminApiError("UNAVAILABLE");
  }
}
