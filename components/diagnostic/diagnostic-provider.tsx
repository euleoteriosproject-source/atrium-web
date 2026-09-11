"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getApplicableQuestions,
  getNextQuestion,
  getPreviousQuestion,
} from "@/domain/diagnostic/branching";
import { deriveAutomationCalculator } from "@/domain/diagnostic/calculator";
import { getQuestion } from "@/domain/diagnostic/questions";
import {
  parseDiagnosticPreload,
  stateFromPreload,
} from "@/domain/diagnostic/preselection";
import {
  calculateAiRiskScore,
  calculateOpportunityScores,
} from "@/domain/diagnostic/scoring";
import {
  createDiagnosticState,
  customAnswerValues,
  selectionCount,
  type DiagnosticAnswer,
  type DiagnosticState,
  type Goal,
  type QuestionDefinition,
} from "@/domain/diagnostic/types";
import {
  clearDiagnosticSession,
  loadDiagnosticSession,
  saveDiagnosticSession,
} from "@/lib/session";

type DiagnosticContextValue = {
  state: DiagnosticState;
  hydrated: boolean;
  currentQuestion?: QuestionDefinition;
  questions: readonly QuestionDefinition[];
  error?: string;
  start: () => void;
  setAnswer: (questionId: string, answer: DiagnosticAnswer) => void;
  setGoalSelection: (goals: Goal[]) => void;
  setPrimaryGoal: (goal: Goal) => void;
  continueJourney: () => void;
  goBack: () => void;
  reset: () => void;
  review: () => void;
};

const DiagnosticContext = createContext<DiagnosticContextValue | null>(null);

function withRecalculatedScores(state: DiagnosticState): DiagnosticState {
  return {
    ...state,
    calculator: deriveAutomationCalculator(state),
    opportunityScores: calculateOpportunityScores(state),
    aiRiskScore: calculateAiRiskScore(state),
  };
}

function answerIsValid(
  question: QuestionDefinition,
  state: DiagnosticState,
): string | undefined {
  const answer = state.answers[question.id];
  if (question.id === "Q001") {
    if (!Array.isArray(answer) || answer.length === 0) {
      return "Selecione pelo menos um objetivo para continuar.";
    }
    if (!state.primaryGoal) {
      return "Escolha qual objetivo é a prioridade neste momento.";
    }
    return undefined;
  }

  if (question.optional && (answer === undefined || answer === "")) {
    return undefined;
  }
  if (question.kind === "multi") {
    const minimum = question.minSelections ?? 1;
    if (
      !Array.isArray(answer) ||
      selectionCount(state, question.id, question.otherOptionValue) < minimum
    ) {
      return minimum === 1
        ? "Selecione pelo menos uma opção para continuar."
        : `Selecione pelo menos ${minimum} opções para continuar.`;
    }
    if (
      question.otherOptionValue &&
      answer.includes(question.otherOptionValue) &&
      customAnswerValues(state, question.id).length === 0
    ) {
      return "Descreva a opção escolhida para continuar.";
    }
    return undefined;
  }
  if (
    question.otherOptionValue &&
    answer === question.otherOptionValue &&
    customAnswerValues(state, question.id).length === 0
  ) {
    return "Descreva a opção escolhida para continuar.";
  }
  if (question.kind === "text") {
    return typeof answer === "string" && answer.trim().length > 0
      ? undefined
      : "Escreva uma resposta para continuar.";
  }
  if (question.kind === "numeric") {
    return typeof answer === "number" && Number.isFinite(answer)
      ? undefined
      : "Informe um número válido para continuar.";
  }
  return typeof answer === "string" && answer.length > 0
    ? undefined
    : "Selecione uma opção para continuar.";
}

export function DiagnosticProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DiagnosticState>(() =>
    createDiagnosticState(),
  );
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const preload = parseDiagnosticPreload(window.location.search);
      const saved = loadDiagnosticSession();
      const shouldUsePreload =
        preload.signature !== undefined &&
        saved?.preloadSignature !== preload.signature;
      const initial = shouldUsePreload
        ? stateFromPreload(preload)
        : (saved ?? stateFromPreload(preload));
      setState(withRecalculatedScores(initial));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (hydrated) saveDiagnosticSession(state);
  }, [hydrated, state]);

  const questions = useMemo(() => getApplicableQuestions(state), [state]);
  const currentQuestion = state.currentQuestionId
    ? getQuestion(state.currentQuestionId)
    : undefined;

  const update = useCallback(
    (transform: (current: DiagnosticState) => DiagnosticState) => {
      setError(undefined);
      setState((current) => withRecalculatedScores(transform(current)));
    },
    [],
  );

  const setAnswer = useCallback(
    (questionId: string, answer: DiagnosticAnswer) => {
      update((current) => {
        const next: DiagnosticState = {
          ...current,
          answers: { ...current.answers, [questionId]: answer },
        };
        if (questionId === "Q002" && typeof answer === "string") {
          next.segment = answer;
        }
        if (questionId === "Q003" && typeof answer === "string") {
          next.companySize = answer;
        }
        if (questionId === "Q004" && Array.isArray(answer)) {
          next.acquisitionChannels = answer;
        }
        if (questionId === "Q005" && Array.isArray(answer)) {
          next.tools = answer;
        }
        return next;
      });
    },
    [update],
  );

  const setGoalSelection = useCallback(
    (selectedGoals: Goal[]) => {
      update((current) => {
        const previousSelection = current.answers.Q001;
        const previousCount = Array.isArray(previousSelection)
          ? previousSelection.length
          : 0;
        const primaryGoal =
          selectedGoals.length === 1
            ? selectedGoals[0]
            : previousCount <= 1
              ? undefined
              : selectedGoals.includes(current.primaryGoal as Goal)
                ? current.primaryGoal
                : undefined;
        return {
          ...current,
          primaryGoal,
          additionalGoals: primaryGoal
            ? selectedGoals.filter((goal) => goal !== primaryGoal)
            : selectedGoals,
          answers: { ...current.answers, Q001: selectedGoals },
        };
      });
    },
    [update],
  );

  const setPrimaryGoal = useCallback(
    (primaryGoal: Goal) => {
      update((current) => {
        const selected = current.answers.Q001;
        const goals = Array.isArray(selected) ? (selected as Goal[]) : [];
        return {
          ...current,
          primaryGoal,
          additionalGoals: goals.filter((goal) => goal !== primaryGoal),
        };
      });
    },
    [update],
  );

  const start = useCallback(() => {
    update((current) => ({
      ...current,
      stage: "questions",
      currentQuestionId: current.currentQuestionId ?? "Q001",
    }));
  }, [update]);

  const continueJourney = useCallback(() => {
    if (!currentQuestion) return;
    const validationError = answerIsValid(currentQuestion, state);
    if (validationError) {
      setError(validationError);
      return;
    }
    const next = getNextQuestion(state, currentQuestion.id);
    update((current) =>
      next
        ? { ...current, currentQuestionId: next.id }
        : { ...current, currentQuestionId: undefined, stage: "complete" },
    );
  }, [currentQuestion, state, update]);

  const goBack = useCallback(() => {
    if (!currentQuestion) return;
    const previous = getPreviousQuestion(state, currentQuestion.id);
    if (previous) {
      update((current) => ({ ...current, currentQuestionId: previous.id }));
    }
  }, [currentQuestion, state, update]);

  const reset = useCallback(() => {
    clearDiagnosticSession();
    window.history.replaceState({}, "", "/diagnostico");
    setError(undefined);
    setState(createDiagnosticState());
  }, []);

  const review = useCallback(() => {
    update((current) => ({
      ...current,
      stage: "questions",
      currentQuestionId: "Q001",
    }));
  }, [update]);

  const value = useMemo<DiagnosticContextValue>(
    () => ({
      state,
      hydrated,
      currentQuestion,
      questions,
      error,
      start,
      setAnswer,
      setGoalSelection,
      setPrimaryGoal,
      continueJourney,
      goBack,
      reset,
      review,
    }),
    [
      state,
      hydrated,
      currentQuestion,
      questions,
      error,
      start,
      setAnswer,
      setGoalSelection,
      setPrimaryGoal,
      continueJourney,
      goBack,
      reset,
      review,
    ],
  );

  return (
    <DiagnosticContext.Provider value={value}>
      {children}
    </DiagnosticContext.Provider>
  );
}

export function useDiagnostic() {
  const context = useContext(DiagnosticContext);
  if (!context) {
    throw new Error(
      "useDiagnostic deve ser usado dentro de DiagnosticProvider",
    );
  }
  return context;
}
