import { normalizeBrazilPhone } from "./brazil-phone.ts";
import {
  editorialTimeframeLabels,
  notificationOpportunityTitles,
  optionLabel,
  primaryGoalOptions,
} from "./lead-editorial-labels.ts";

export type LeadOutreachWhatsAppInput = Readonly<{
  contactName?: string | null;
  phone: string;
  primaryGoal?: string | null;
  timeframe?: string | null;
  topOpportunities?: readonly Readonly<{
    dimension?: string | null;
    title?: string | null;
  }>[];
}>;

function firstName(value: string | null | undefined) {
  const normalized = value?.trim().split(/\s+/u)[0];
  return normalized && /^[\p{L}'-]{2,80}$/u.test(normalized)
    ? normalized
    : undefined;
}

function primaryOpportunity(input: LeadOutreachWhatsAppInput) {
  const opportunity = input.topOpportunities?.[0];
  if (!opportunity) return undefined;
  const dimension = opportunity.dimension?.trim();
  if (dimension) {
    const title =
      notificationOpportunityTitles[
        dimension as keyof typeof notificationOpportunityTitles
      ];
    if (title) return title.toLocaleLowerCase("pt-BR");
  }
  const title = opportunity.title?.trim();
  return title && title.length <= 160 ? title : undefined;
}

export function buildLeadOutreachWhatsAppMessage(
  input: LeadOutreachWhatsAppInput,
) {
  const name = firstName(input.contactName);
  const goal = optionLabel(
    primaryGoalOptions,
    input.primaryGoal?.trim() || undefined,
  );
  const opportunity = primaryOpportunity(input);
  const timeframe = input.timeframe
    ? editorialTimeframeLabels[
        input.timeframe as keyof typeof editorialTimeframeLabels
      ]
    : undefined;

  const lines = [
    name
      ? `Olá, ${name}! Aqui é o Vinicius, da Atrium.`
      : "Olá! Aqui é o Vinicius, da Atrium.",
    "",
    goal
      ? `Você realizou nosso diagnóstico indicando interesse em ${goal.toLocaleLowerCase("pt-BR")}.`
      : "Você realizou nosso diagnóstico e compartilhou um pouco do cenário da sua empresa.",
  ];

  if (opportunity) {
    lines.push("", `A análise destacou principalmente ${opportunity}.`);
  }
  if (timeframe) {
    lines.push(
      "",
      `Vi também que seu momento é ${timeframe.toLocaleLowerCase("pt-BR")}.`,
    );
  }

  lines.push(
    "",
    "Queria entender melhor seu cenário e ver se faz sentido avançarmos em alguma dessas oportunidades.",
    "",
    "Podemos conversar por aqui?",
  );
  return lines.join("\n");
}

export function buildLeadOutreachWhatsAppUrl(input: LeadOutreachWhatsAppInput) {
  const phone = normalizeBrazilPhone(input.phone);
  if (!phone) return undefined;
  return `https://wa.me/${phone}?text=${encodeURIComponent(
    buildLeadOutreachWhatsAppMessage(input),
  )}`;
}
