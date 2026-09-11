import { z } from "zod";

export const DIAGNOSTIC_VERSION = "1.0.0" as const;

export const goals = [
  "SALES",
  "CONVERSION",
  "AUTOMATION",
  "SERVICE",
  "WEBSITE",
  "SOFTWARE",
  "INTEGRATION",
  "AI",
  "DISCOVERY",
] as const;

export const opportunityDimensions = [
  "digital",
  "sales",
  "service",
  "automation",
  "integration",
  "software",
  "ai",
] as const;

export type Goal = (typeof goals)[number];
export type OpportunityDimension = (typeof opportunityDimensions)[number];
export type DiagnosticAnswer = string | string[] | number;

export type QuestionKind = "single" | "multi" | "text" | "numeric";
export type DiagnosticStage = "intro" | "questions" | "complete";

export type QuestionOption = Readonly<{
  value: string;
  label: string;
  description?: string;
}>;

export type QuestionCondition = Readonly<{
  questionId: string;
  includes: string;
}>;

export type QuestionDefinition = Readonly<{
  id: string;
  kind: QuestionKind;
  title: string;
  description?: string;
  options?: readonly QuestionOption[];
  optional?: boolean;
  minSelections?: number;
  maxSelections?: number;
  maxLength?: number;
  otherOptionValue?: string;
  otherInputLabel?: string;
  condition?: QuestionCondition;
}>;

export type CalculatorContext = Readonly<{
  people?: number;
  minutesPerDay?: number;
  daysPerWeek?: number;
  estimatedMonthlyHours?: number;
}>;

export type DiagnosticState = {
  version: typeof DIAGNOSTIC_VERSION;
  startedAt: string;
  primaryGoal?: Goal;
  additionalGoals: Goal[];
  segment?: string;
  companySize?: string;
  acquisitionChannels: string[];
  tools: string[];
  answers: Record<string, DiagnosticAnswer>;
  opportunityScores: Record<OpportunityDimension, number>;
  aiRiskScore: number;
  calculator?: CalculatorContext;
  currentQuestionId?: string;
  stage: DiagnosticStage;
  preloadSignature?: string;
};

export const goalSchema = z.enum(goals);
export const diagnosticAnswerSchema = z.union([
  z.string(),
  z.array(z.string()),
  z.number().finite(),
]);

export const opportunityScoresSchema = z.object({
  digital: z.number().finite(),
  sales: z.number().finite(),
  service: z.number().finite(),
  automation: z.number().finite(),
  integration: z.number().finite(),
  software: z.number().finite(),
  ai: z.number().finite(),
});

export const diagnosticStateSchema = z.object({
  version: z.literal(DIAGNOSTIC_VERSION),
  startedAt: z.string().min(1),
  primaryGoal: goalSchema.optional(),
  additionalGoals: z.array(goalSchema),
  segment: z.string().optional(),
  companySize: z.string().optional(),
  acquisitionChannels: z.array(z.string()),
  tools: z.array(z.string()),
  answers: z.record(z.string(), diagnosticAnswerSchema),
  opportunityScores: opportunityScoresSchema,
  aiRiskScore: z.number().finite(),
  calculator: z
    .object({
      people: z.number().finite().optional(),
      minutesPerDay: z.number().finite().optional(),
      daysPerWeek: z.number().finite().optional(),
      estimatedMonthlyHours: z.number().finite().optional(),
    })
    .optional(),
  currentQuestionId: z.string().optional(),
  stage: z.enum(["intro", "questions", "complete"]),
  preloadSignature: z.string().optional(),
});

export function emptyOpportunityScores(): Record<OpportunityDimension, number> {
  return {
    digital: 0,
    sales: 0,
    service: 0,
    automation: 0,
    integration: 0,
    software: 0,
    ai: 0,
  };
}

export function createDiagnosticState(now: Date = new Date()): DiagnosticState {
  return {
    version: DIAGNOSTIC_VERSION,
    startedAt: now.toISOString(),
    additionalGoals: [],
    acquisitionChannels: [],
    tools: [],
    answers: {},
    opportunityScores: emptyOpportunityScores(),
    aiRiskScore: 0,
    stage: "intro",
  };
}

export function stringAnswer(
  state: DiagnosticState,
  questionId: string,
): string | undefined {
  const answer = state.answers[questionId];
  return typeof answer === "string" ? answer : undefined;
}

export function listAnswer(
  state: DiagnosticState,
  questionId: string,
): string[] {
  const answer = state.answers[questionId];
  return Array.isArray(answer) ? answer : [];
}

export function customAnswerValues(
  state: DiagnosticState,
  questionId: string,
): string[] {
  const custom = stringAnswer(state, `${questionId}_OTHER`);
  return custom
    ? custom
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];
}

export function selectionCount(
  state: DiagnosticState,
  questionId: string,
  otherOptionValue = "OTHER",
): number {
  const selected = listAnswer(state, questionId);
  return (
    selected.filter((value) => value !== otherOptionValue).length +
    (selected.includes(otherOptionValue)
      ? customAnswerValues(state, questionId).length
      : 0)
  );
}
