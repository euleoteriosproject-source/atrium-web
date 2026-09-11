import { calculateMonthlyHours } from "@/lib/manual-work-calculator";

import {
  createDiagnosticState,
  goalSchema,
  type CalculatorContext,
  type DiagnosticState,
  type Goal,
} from "./types";

export const diagnosticQueryParams = {
  goal: "goal",
  people: "people",
  minutesPerDay: "minutesPerDay",
  daysPerWeek: "daysPerWeek",
  monthlyHours: "monthlyHours",
} as const;

export type DiagnosticPreload = Readonly<{
  goal?: Goal;
  calculator?: CalculatorContext;
  signature?: string;
}>;

function validNumber(
  params: URLSearchParams,
  key: string,
  minimum: number,
  maximum: number,
): number | undefined {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= minimum && value <= maximum
    ? value
    : undefined;
}

export function parseDiagnosticPreload(search: string): DiagnosticPreload {
  const params = new URLSearchParams(search);
  const parsedGoal = goalSchema.safeParse(
    params.get(diagnosticQueryParams.goal),
  );
  const goal = parsedGoal.success ? parsedGoal.data : undefined;
  const people = validNumber(params, diagnosticQueryParams.people, 1, 999);
  const minutesPerDay = validNumber(
    params,
    diagnosticQueryParams.minutesPerDay,
    1,
    1440,
  );
  const daysPerWeek = validNumber(
    params,
    diagnosticQueryParams.daysPerWeek,
    1,
    7,
  );

  const completeCalculator =
    people !== undefined &&
    minutesPerDay !== undefined &&
    daysPerWeek !== undefined;
  const calculator = completeCalculator
    ? {
        people,
        minutesPerDay,
        daysPerWeek,
        estimatedMonthlyHours: calculateMonthlyHours({
          people,
          minutesPerDay,
          daysPerWeek,
        }),
      }
    : undefined;

  const signatureParams = new URLSearchParams();
  if (goal) signatureParams.set(diagnosticQueryParams.goal, goal);
  if (calculator) {
    signatureParams.set(diagnosticQueryParams.people, String(people));
    signatureParams.set(
      diagnosticQueryParams.minutesPerDay,
      String(minutesPerDay),
    );
    signatureParams.set(diagnosticQueryParams.daysPerWeek, String(daysPerWeek));
  }
  const signature = signatureParams.toString() || undefined;

  return { goal, calculator, signature };
}

export function stateFromPreload(
  preload: DiagnosticPreload,
  now: Date = new Date(),
): DiagnosticState {
  const state = createDiagnosticState(now);
  if (!preload.goal && !preload.calculator) return state;

  return {
    ...state,
    primaryGoal: preload.goal,
    answers: preload.goal ? { Q001: [preload.goal] } : {},
    calculator: preload.calculator,
    preloadSignature: preload.signature,
  };
}

export function buildDiagnosticHref(input: {
  goal?: Goal;
  calculator?: Required<CalculatorContext>;
}): string {
  const params = new URLSearchParams();
  if (input.goal) params.set(diagnosticQueryParams.goal, input.goal);
  if (input.calculator) {
    params.set(diagnosticQueryParams.people, String(input.calculator.people));
    params.set(
      diagnosticQueryParams.minutesPerDay,
      String(input.calculator.minutesPerDay),
    );
    params.set(
      diagnosticQueryParams.daysPerWeek,
      String(input.calculator.daysPerWeek),
    );
    params.set(
      diagnosticQueryParams.monthlyHours,
      String(input.calculator.estimatedMonthlyHours),
    );
  }
  const query = params.toString();
  return query ? `/diagnostico?${query}` : "/diagnostico";
}
