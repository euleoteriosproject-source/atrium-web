import { buildDiagnosticResult } from "@/domain/diagnostic/results";
import { collectEvidence, evidenceIds } from "@/domain/diagnostic/evidence";
import { getQuestion, goalOptions } from "@/domain/diagnostic/questions";
import type { DiagnosticState } from "@/domain/diagnostic/types";
import { timeframeLabels, type Timeframe } from "@/domain/lead/schema";

export type WhatsAppMessageInput = Readonly<{
  diagnostic: DiagnosticState;
  companyName: string;
  timeframe: Timeframe | null;
  publicCode: string | null;
}>;

const levelLabels = {
  HIGH: "Alta",
  MODERATE: "Moderada",
  LOW: "Baixa prioridade",
} as const;

function optionLabel(questionId: string, value?: string) {
  return getQuestion(questionId)?.options?.find(
    (option) => option.value === value,
  )?.label;
}

export function buildWhatsAppMessage(input: WhatsAppMessageInput) {
  const result = buildDiagnosticResult(input.diagnostic);
  const goal = goalOptions.find(
    (option) => option.value === input.diagnostic.primaryGoal,
  )?.label;
  const segment = optionLabel("Q002", input.diagnostic.segment);
  const companySize = optionLabel("Q003", input.diagnostic.companySize);
  const opportunityEvidence = result.opportunities
    .flatMap((opportunity) => opportunity.evidence.map((item) => item.label))
    .filter((label, index, labels) => labels.indexOf(label) === index);
  const evidence = [
    ...opportunityEvidence,
    ...collectEvidence(input.diagnostic, evidenceIds, 5).map(
      (item) => item.label,
    ),
  ]
    .filter((label, index, labels) => labels.indexOf(label) === index)
    .slice(0, 5);

  const lines = [
    "Olá! Fiz o Diagnóstico Atrium.",
    "",
    `Diagnóstico: ${input.publicCode ?? "não registrado"}`,
    "",
    "EMPRESA",
    `Empresa: ${input.companyName}`,
    `Segmento: ${segment ?? "Não informado"}`,
    `Equipe: ${companySize ? `${companySize} pessoas` : "Não informado"}`,
    "",
    "OBJETIVO",
    goal ?? "Não informado",
  ];

  if (evidence.length > 0) {
    lines.push("", "CENÁRIO", ...evidence.map((item) => `- ${item}`));
  }

  lines.push("", "OPORTUNIDADES");
  if (result.opportunities.length === 0) {
    lines.push("Ainda sem uma prioridade conclusiva");
  } else {
    lines.push(
      ...result.opportunities
        .slice(0, 3)
        .map(
          (opportunity, index) =>
            `${index + 1}. ${opportunity.title} — ${levelLabels[opportunity.level]}`,
        ),
    );
  }

  lines.push(
    "",
    "MOMENTO",
    input.timeframe ? timeframeLabels[input.timeframe] : "Não informado",
    "",
    "Gostaria de conversar sobre essas possibilidades.",
  );

  return lines.join("\n");
}

export function buildWhatsAppUrl(
  whatsappNumber: string,
  input: WhatsAppMessageInput,
) {
  const digits = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(buildWhatsAppMessage(input))}`;
}
