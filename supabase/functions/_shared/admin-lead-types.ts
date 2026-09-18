export const adminLeadStatuses = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "WON",
  "LOST",
] as const;

export const adminLeadTiers = ["A", "B", "C", "D"] as const;

export const adminLeadTimeframes = [
  "NOW",
  "ONE_TO_THREE_MONTHS",
  "THREE_TO_SIX_MONTHS",
  "EXPLORING",
] as const;

export type AdminLeadStatus = (typeof adminLeadStatuses)[number];
export type AdminLeadTier = (typeof adminLeadTiers)[number];
export type AdminLeadTimeframe = (typeof adminLeadTimeframes)[number];
export type AdminLeadHandoffFilter = "OPENED" | "NOT_OPENED";

export const adminLeadActivityTypes = [
  "LEAD_CREATED",
  "WHATSAPP_HANDOFF",
  "STATUS_CHANGED",
  "CONTACT_RECORDED",
  "NOTE_ADDED",
  "FOLLOW_UP_SET",
  "FOLLOW_UP_CLEARED",
] as const;
export type AdminLeadActivityType = (typeof adminLeadActivityTypes)[number];

export const adminLeadStatusLabels: Record<AdminLeadStatus, string> = {
  NEW: "Novo",
  CONTACTED: "Contatado",
  QUALIFIED: "Qualificado",
  PROPOSAL: "Proposta",
  WON: "Ganho",
  LOST: "Perdido",
};

export const adminLeadTimeframeLabels: Record<AdminLeadTimeframe, string> = {
  NOW: "Agora / o quanto antes",
  ONE_TO_THREE_MONTHS: "Nos próximos 1–3 meses",
  THREE_TO_SIX_MONTHS: "Nos próximos 3–6 meses",
  EXPLORING: "Estou explorando",
};

export type AdminLeadSummary = Readonly<{
  total: number;
  byStatus: Record<AdminLeadStatus, number>;
}>;

export type AdminLeadListItem = Readonly<{
  publicCode: string;
  createdAt: string;
  companyName: string;
  contactName: string;
  phone: string;
  status: AdminLeadStatus;
  leadTier: AdminLeadTier;
  leadScore: number;
  timeframe: AdminLeadTimeframe | null;
  primaryGoal: string;
  whatsappHandoffAt: string | null;
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
}>;

export type AdminLeadListResponse = Readonly<{
  success: true;
  items: readonly AdminLeadListItem[];
  summary: AdminLeadSummary;
  pagination: Readonly<{
    page: number;
    pageSize: 25;
    total: number;
    totalPages: number;
  }>;
}>;

export type AdminLeadDetail = Readonly<{
  publicCode: string;
  createdAt: string;
  status: AdminLeadStatus;
  statusUpdatedAt: string;
  whatsappHandoffAt: string | null;
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
  outreachWhatsAppUrl: string | null;
  contact: Readonly<{
    name: string;
    company: string;
    phone: string;
    email: string | null;
  }>;
  profile: Readonly<{
    businessSegment: string | null;
    companySize: string | null;
    primaryGoal: string;
    additionalGoals: readonly string[];
    timeframe: string | null;
    budgetRange: string | null;
  }>;
  qualification: Readonly<{
    score: number;
    tier: AdminLeadTier;
  }>;
  opportunities: readonly Readonly<{
    title: string;
    priority: string;
    summary: string | null;
  }>[];
  diagnosticHighlights: readonly Readonly<{
    label: string;
    values: readonly string[];
  }>[];
  attribution: readonly Readonly<{
    label: string;
    value: string;
  }>[];
  consent: Readonly<{
    contact: true;
    at: string;
  }>;
  activities: readonly AdminLeadActivity[];
}>;

export type AdminLeadActivity = Readonly<{
  type: AdminLeadActivityType;
  createdAt: string;
  label: string;
  detail: string | null;
  note: string | null;
}>;

export type AdminLeadDetailResponse = Readonly<{
  success: true;
  lead: AdminLeadDetail;
}>;
