export type EditorialOption = Readonly<{ value: string; label: string }>;

export const primaryGoalOptions = [
  { value: "SALES", label: "Atrair mais clientes" },
  {
    value: "CONVERSION",
    label: "Converter mais oportunidades em vendas",
  },
  { value: "AUTOMATION", label: "Reduzir trabalho manual" },
  { value: "SERVICE", label: "Melhorar atendimento" },
  { value: "WEBSITE", label: "Criar ou melhorar meu site" },
  { value: "SOFTWARE", label: "Criar um sistema" },
  { value: "INTEGRATION", label: "Integrar ferramentas" },
  { value: "AI", label: "Usar inteligência artificial" },
  { value: "DISCOVERY", label: "Quero descobrir oportunidades" },
] as const satisfies readonly EditorialOption[];

export const businessSegmentOptions = [
  { value: "SERVICES", label: "Serviços" },
  { value: "REAL_ESTATE", label: "Imobiliário" },
  { value: "FINANCE", label: "Financeiro / Crédito" },
  { value: "EDUCATION", label: "Educação" },
  { value: "HEALTH", label: "Saúde" },
  { value: "COMMERCE", label: "Comércio" },
  { value: "INDUSTRY", label: "Indústria" },
  { value: "TECHNOLOGY", label: "Tecnologia" },
  { value: "INDEPENDENT", label: "Profissional liberal" },
  { value: "CONSTRUCTION", label: "Construção / Engenharia" },
  { value: "LOGISTICS", label: "Logística" },
  { value: "OTHER", label: "Outro" },
] as const satisfies readonly EditorialOption[];

export const companySizeOptions = [
  { value: "ONE", label: "1" },
  { value: "TWO_TO_FIVE", label: "2–5" },
  { value: "SIX_TO_TWENTY", label: "6–20" },
  { value: "TWENTY_ONE_TO_FIFTY", label: "21–50" },
  { value: "FIFTY_ONE_PLUS", label: "51+" },
] as const satisfies readonly EditorialOption[];

export const editorialTimeframeLabels = {
  NOW: "Agora / o quanto antes",
  ONE_TO_THREE_MONTHS: "Nos próximos 1–3 meses",
  THREE_TO_SIX_MONTHS: "Nos próximos 3–6 meses",
  EXPLORING: "Estou explorando",
} as const;

export const editorialOpportunityDimensionLabels = {
  digital: "Presença digital",
  sales: "Vendas e conversão",
  service: "Atendimento",
  automation: "Automação",
  integration: "Integração",
  software: "Sistema sob medida",
  ai: "IA aplicada",
} as const;

export const notificationOpportunityTitles = {
  digital: "Fortalecer a presença digital",
  sales: "Estruturar vendas e acompanhamento",
  service: "Melhorar o atendimento",
  automation: "Reduzir trabalho manual com automação",
  integration: "Conectar sistemas e informações",
  software: "Avaliar um sistema sob medida",
  ai: "Aplicar IA com segurança",
} as const;

export const opportunityPriorityLabels = {
  HIGH: "Alta",
  MODERATE: "Moderada",
  LOW: "Baixa",
} as const;

export function optionLabel(
  options: readonly EditorialOption[],
  value: string | undefined,
) {
  if (!value) return undefined;
  return options.find((option) => option.value === value)?.label;
}

export function companySizeLabel(value: string | undefined) {
  const label = optionLabel(companySizeOptions, value);
  if (!label) return undefined;
  return `${label} ${value === "ONE" ? "pessoa" : "pessoas"}`;
}
