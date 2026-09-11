import { calculateMonthlyHours } from "@/lib/manual-work-calculator";

import {
  stringAnswer,
  type CalculatorContext,
  type DiagnosticState,
} from "./types";

const peopleMidpoint: Record<string, number> = {
  ONE: 1,
  TWO_TO_THREE: 2.5,
  FOUR_TO_SIX: 5,
  SEVEN_PLUS: 7,
};

const minutesMidpoint: Record<string, number> = {
  UNDER_15: 7.5,
  FIFTEEN_TO_THIRTY: 22.5,
  THIRTY_TO_SIXTY: 45,
  ONE_TO_TWO_HOURS: 90,
  OVER_TWO_HOURS: 120,
};

const daysPerWeekEstimate: Record<string, number> = {
  MONTHLY: 0.5,
  WEEKLY: 1,
  DAILY: 5,
  MANY_DAILY: 5,
};

export function deriveAutomationCalculator(
  state: DiagnosticState,
): CalculatorContext | undefined {
  if (state.primaryGoal !== "AUTOMATION") return state.calculator;

  const people = peopleMidpoint[stringAnswer(state, "A003") ?? ""];
  const minutesPerDay = minutesMidpoint[stringAnswer(state, "A004") ?? ""];
  const daysPerWeek = daysPerWeekEstimate[stringAnswer(state, "A002") ?? ""];

  if (
    people === undefined ||
    minutesPerDay === undefined ||
    daysPerWeek === undefined
  ) {
    return state.calculator;
  }

  return {
    people,
    minutesPerDay,
    daysPerWeek,
    estimatedMonthlyHours: calculateMonthlyHours({
      people,
      minutesPerDay,
      daysPerWeek,
    }),
  };
}
