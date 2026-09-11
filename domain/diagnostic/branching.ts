import { branchQuestions, universalQuestions } from "./questions";
import {
  answeredDiagnosticQuestionCount,
  calculateOpportunityScores,
} from "./scoring";
import type { DiagnosticState, QuestionDefinition } from "./types";

export const DISCOVERY_MINIMUM_ANSWERS = 7;
export const STRONG_EVIDENCE_THRESHOLD = 4;
export const STRONG_DIMENSIONS_TO_STOP = 3;

export function matchesCondition(
  question: QuestionDefinition,
  state: DiagnosticState,
): boolean {
  if (!question.condition) return true;
  const answer = state.answers[question.condition.questionId];
  return Array.isArray(answer)
    ? answer.includes(question.condition.includes)
    : answer === question.condition.includes;
}

export function shouldStopDiscovery(state: DiagnosticState): boolean {
  if (state.primaryGoal !== "DISCOVERY") return false;
  if (answeredDiagnosticQuestionCount(state) < DISCOVERY_MINIMUM_ANSWERS) {
    return false;
  }

  const scores = calculateOpportunityScores(state);
  return (
    Object.values(scores).filter((score) => score >= STRONG_EVIDENCE_THRESHOLD)
      .length >= STRONG_DIMENSIONS_TO_STOP
  );
}

export function getApplicableQuestions(
  state: DiagnosticState,
): readonly QuestionDefinition[] {
  if (!state.primaryGoal) return universalQuestions;

  const branch = branchQuestions[state.primaryGoal].filter((question) =>
    matchesCondition(question, state),
  );

  if (state.primaryGoal !== "DISCOVERY" || !shouldStopDiscovery(state)) {
    return [...universalQuestions, ...branch];
  }

  const answeredBranch = branch.filter(
    (question) => state.answers[question.id] !== undefined,
  );
  return [...universalQuestions, ...answeredBranch];
}

export function getNextQuestion(
  state: DiagnosticState,
  currentQuestionId: string,
): QuestionDefinition | undefined {
  const questions = getApplicableQuestions(state);
  const index = questions.findIndex(({ id }) => id === currentQuestionId);
  return index >= 0 ? questions[index + 1] : questions[0];
}

export function getPreviousQuestion(
  state: DiagnosticState,
  currentQuestionId: string,
): QuestionDefinition | undefined {
  const questions = getApplicableQuestions(state);
  const index = questions.findIndex(({ id }) => id === currentQuestionId);
  return index > 0 ? questions[index - 1] : undefined;
}
