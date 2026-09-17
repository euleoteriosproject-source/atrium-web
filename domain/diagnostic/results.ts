import { collectEvidence, type EvidenceItem } from "./evidence";
import { selectInsight } from "./insights";
import { getQuestion, goalOptions } from "./questions";
import { calculateAiRiskScore, calculateOpportunityScores } from "./scoring";
import {
  stringAnswer,
  type DiagnosticState,
  type Goal,
  type OpportunityDimension,
} from "./types";
import { editorialOpportunityDimensionLabels } from "@/supabase/functions/_shared/lead-editorial-labels";

export type OpportunityLevel = "HIGH" | "MODERATE" | "LOW";

export type OpportunityResult = Readonly<{
  dimension: OpportunityDimension;
  level: OpportunityLevel;
  title: string;
  summary: string;
  whyItMatters: string;
  whatToEvaluate: string;
  evidence: readonly EvidenceItem[];
  caution?: string;
}>;

export type ResultContextItem = Readonly<{
  label: string;
  value: string;
}>;

export type DiagnosticResult = Readonly<{
  opportunities: readonly OpportunityResult[];
  context: readonly ResultContextItem[];
  interpretation: string;
  aiGuidance?: string;
}>;

export const OPPORTUNITY_LEVEL_THRESHOLDS = {
  high: 7,
  moderate: 4,
} as const;

export const MAX_RESULT_OPPORTUNITIES = 3;

const dimensionOrder: readonly OpportunityDimension[] = [
  "automation",
  "integration",
  "sales",
  "service",
  "digital",
  "software",
  "ai",
];

const goalDimension: Partial<Record<Goal, OpportunityDimension>> = {
  SALES: "sales",
  CONVERSION: "sales",
  AUTOMATION: "automation",
  SERVICE: "service",
  WEBSITE: "digital",
  SOFTWARE: "software",
  INTEGRATION: "integration",
  AI: "ai",
};

export const opportunityDimensionLabels: Record<OpportunityDimension, string> =
  editorialOpportunityDimensionLabels;

export const opportunityLevelLabels: Record<OpportunityLevel, string> = {
  HIGH: "Oportunidade alta",
  MODERATE: "Oportunidade moderada",
  LOW: "Oportunidade baixa",
};

export function getOpportunityLevel(score: number): OpportunityLevel {
  if (score >= OPPORTUNITY_LEVEL_THRESHOLDS.high) return "HIGH";
  if (score >= OPPORTUNITY_LEVEL_THRESHOLDS.moderate) return "MODERATE";
  return "LOW";
}

function optionLabel(questionId: string, value?: string) {
  if (!value) return undefined;
  return getQuestion(questionId)?.options?.find(
    (option) => option.value === value,
  )?.label;
}

function contextFromState(state: DiagnosticState): ResultContextItem[] {
  const context: ResultContextItem[] = [];
  const goal = goalOptions.find(
    (option) => option.value === state.primaryGoal,
  )?.label;
  if (goal) context.push({ label: "Prioridade", value: goal });

  const segmentValue = state.segment ?? stringAnswer(state, "Q002");
  const customSegment = stringAnswer(state, "Q002_OTHER")?.trim();
  const segment =
    segmentValue === "OTHER"
      ? customSegment || optionLabel("Q002", segmentValue)
      : optionLabel("Q002", segmentValue);
  if (segment) context.push({ label: "Negócio", value: segment });

  const sizeValue = state.companySize ?? stringAnswer(state, "Q003");
  const size = optionLabel("Q003", sizeValue);
  if (size) context.push({ label: "Equipe", value: `${size} pessoas` });

  return context;
}

function adjustedScores(state: DiagnosticState) {
  const scores = calculateOpportunityScores(state);
  const aiRisk = calculateAiRiskScore(state);
  let adjustedAi = scores.ai;

  if (aiRisk >= 3 && stringAnswer(state, "AI005") === "NO") adjustedAi -= 3;
  if (scores.automation >= OPPORTUNITY_LEVEL_THRESHOLDS.high && scores.ai < 5) {
    adjustedAi -= 1;
  }

  return {
    scores: { ...scores, ai: adjustedAi },
    rawScores: scores,
    aiRisk,
  };
}

function interpretationFor(count: number) {
  if (count === 0) {
    return "As respostas ainda não formam evidência forte o suficiente para priorizar uma frente. Vale observar a rotina por alguns dias e registrar onde surgem atrasos, retrabalho ou perda de contexto.";
  }
  if (count === 1) {
    return "Uma frente apareceu com evidência mais consistente. O melhor próximo passo é confirmar o processo atual, medir seu volume e delimitar um primeiro teste.";
  }
  return `As respostas apontam ${count} frentes que merecem investigação. A ordem abaixo considera intensidade dos sinais, prioridade declarada e segurança para começar — não uma promessa de resultado.`;
}

export function isCompletedDiagnostic(state: DiagnosticState) {
  return state.stage === "complete" && Boolean(state.primaryGoal);
}

export function buildDiagnosticResult(
  state: DiagnosticState,
): DiagnosticResult {
  const { scores, rawScores, aiRisk } = adjustedScores(state);
  const primaryDimension = state.primaryGoal
    ? goalDimension[state.primaryGoal]
    : undefined;

  const candidates = dimensionOrder
    .map((dimension, stableIndex) => {
      const score = scores[dimension];
      const insight = selectInsight(state, dimension);
      const evidence = insight
        ? collectEvidence(state, insight.evidenceIds, 4)
        : [];

      return { dimension, stableIndex, score, insight, evidence };
    })
    .filter(
      (candidate) =>
        candidate.score >= OPPORTUNITY_LEVEL_THRESHOLDS.moderate &&
        candidate.insight !== undefined &&
        candidate.evidence.length >= 2,
    )
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const leftPrimary = left.dimension === primaryDimension ? 1 : 0;
      const rightPrimary = right.dimension === primaryDimension ? 1 : 0;
      if (rightPrimary !== leftPrimary) return rightPrimary - leftPrimary;
      return left.stableIndex - right.stableIndex;
    })
    .slice(0, MAX_RESULT_OPPORTUNITIES);

  const opportunities: OpportunityResult[] = candidates.map(
    ({ dimension, score, insight, evidence }) => {
      if (!insight) throw new Error("Insight ausente após seleção");
      const caution =
        dimension === "ai" && aiRisk >= 3
          ? stringAnswer(state, "AI005") === "NO"
            ? "Como erros podem ter alto impacto e não há revisão humana prevista, a IA não deve decidir ou publicar sozinha. Comece com apoio à análise, critérios explícitos e validação obrigatória."
            : "Como erros podem ter alto impacto, qualquer teste precisa de critérios claros, revisão humana e limites para decisões sensíveis."
          : undefined;

      return {
        dimension,
        level: getOpportunityLevel(score),
        title: insight.title,
        summary: insight.summary,
        whyItMatters: insight.whyItMatters,
        whatToEvaluate: insight.whatToEvaluate,
        evidence,
        caution,
      };
    },
  );

  const aiGuidance =
    rawScores.ai < OPPORTUNITY_LEVEL_THRESHOLDS.moderate &&
    (rawScores.automation >= OPPORTUNITY_LEVEL_THRESHOLDS.moderate ||
      rawScores.integration >= OPPORTUNITY_LEVEL_THRESHOLDS.moderate)
      ? "Os sinais atuais sugerem começar por automação convencional ou integração. IA pode ser reavaliada depois, caso exista uma tarefa específica, volume suficiente e critérios seguros de revisão."
      : undefined;

  return {
    opportunities,
    context: contextFromState(state),
    interpretation: interpretationFor(opportunities.length),
    aiGuidance,
  };
}
