"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/container";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";

import { DiagnosticNavigation } from "./diagnostic-navigation";
import { DiagnosticProgress } from "./diagnostic-progress";
import { QuestionRenderer } from "./question-renderer";
import { useDiagnostic } from "./diagnostic-provider";

export function DiagnosticShell() {
  const {
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
  } = useDiagnostic();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (hydrated) headingRef.current?.focus();
  }, [hydrated, state.stage, state.currentQuestionId]);

  if (!hydrated) {
    return (
      <DiagnosticFrame>
        <p role="status" className="text-body text-gray-text">
          Preparando diagnóstico…
        </p>
      </DiagnosticFrame>
    );
  }

  if (state.stage === "intro") {
    return (
      <DiagnosticFrame>
        <div className="max-w-3xl">
          <Eyebrow>Diagnóstico Atrium</Eyebrow>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-5 text-h1 font-semibold focus:outline-none"
          >
            Vamos entender sua operação.
          </h1>
          <p className="mt-6 max-w-2xl text-body-lg text-gray-text">
            Não vamos começar perguntando qual tecnologia você quer. Vamos
            começar entendendo o que você gostaria de melhorar. Suas respostas
            ficam apenas neste navegador.
          </p>
          {state.calculator?.estimatedMonthlyHours !== undefined ? (
            <p className="mt-6 border-l-2 border-gold-500 pl-4 text-body text-navy-800">
              Sua estimativa de aproximadamente{" "}
              <strong>
                {state.calculator.estimatedMonthlyHours.toLocaleString(
                  "pt-BR",
                  {
                    maximumFractionDigits: 1,
                  },
                )}{" "}
                horas por mês
              </strong>{" "}
              já está vinculada a este diagnóstico.
            </p>
          ) : null}
          <Button size="lg" className="mt-9" onClick={start}>
            Começar diagnóstico
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </DiagnosticFrame>
    );
  }

  if (state.stage === "complete") {
    return (
      <DiagnosticFrame>
        <Card className="mx-auto max-w-3xl border-navy-950/15 bg-white text-center shadow-none">
          <Eyebrow className="justify-center">Etapa concluída</Eyebrow>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-5 text-h2 font-semibold focus:outline-none"
          >
            Diagnóstico concluído.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-body-lg text-gray-text">
            Suas respostas foram organizadas e permanecem salvas neste
            navegador.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={review}>Revisar respostas</Button>
            <Button variant="secondary" onClick={reset}>
              Reiniciar diagnóstico
            </Button>
          </div>
        </Card>
      </DiagnosticFrame>
    );
  }

  if (!currentQuestion) {
    return (
      <DiagnosticFrame>
        <p role="alert" className="text-body text-danger">
          Não foi possível restaurar esta etapa. Reinicie o diagnóstico para
          continuar.
        </p>
        <Button className="mt-5" onClick={reset}>
          Reiniciar diagnóstico
        </Button>
      </DiagnosticFrame>
    );
  }

  const index = questions.findIndex(({ id }) => id === currentQuestion.id);
  const answer = state.answers[currentQuestion.id];

  return (
    <DiagnosticFrame onReset={reset}>
      <div className="mx-auto max-w-4xl">
        <DiagnosticProgress question={currentQuestion} questions={questions} />
        <div className="mt-8 sm:mt-10">
          <p className="text-caption font-bold tracking-[0.12em] text-gray-text uppercase">
            {currentQuestion.id}
            {currentQuestion.optional ? " · opcional" : ""}
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 max-w-3xl text-h2 font-semibold focus:outline-none"
          >
            {currentQuestion.title}
          </h1>
          {currentQuestion.description ? (
            <p className="mt-4 max-w-2xl text-body text-gray-text">
              {currentQuestion.description}
            </p>
          ) : null}
        </div>

        <div className="mt-7 sm:mt-8">
          <QuestionRenderer
            question={currentQuestion}
            answer={answer}
            otherAnswer={state.answers[`${currentQuestion.id}_OTHER`]}
            primaryGoal={state.primaryGoal}
            onAnswer={(next) => setAnswer(currentQuestion.id, next)}
            onOtherAnswer={(next) =>
              setAnswer(`${currentQuestion.id}_OTHER`, next)
            }
            onGoalSelection={setGoalSelection}
            onPrimaryGoal={setPrimaryGoal}
          />
        </div>

        {error ? (
          <p
            id="diagnostic-error"
            role="alert"
            className="mt-5 border-l-2 border-danger pl-3 text-body-sm font-semibold text-danger"
          >
            {error}
          </p>
        ) : null}

        <DiagnosticNavigation
          canGoBack={index > 0}
          onBack={goBack}
          onContinue={continueJourney}
          finalStep={index === questions.length - 1}
        />
      </div>
    </DiagnosticFrame>
  );
}

function DiagnosticFrame({
  children,
  onReset,
}: {
  children: React.ReactNode;
  onReset?: () => void;
}) {
  return (
    <div className="min-h-screen bg-offwhite text-navy-950">
      <header className="border-b border-navy-950/10 bg-offwhite">
        <Container className="flex min-h-18 items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="Atrium — página inicial"
            className="inline-flex min-h-11 items-center gap-2 text-h4 font-semibold tracking-tight"
          >
            <span aria-hidden="true" className="size-2 bg-gold-500" />
            Atrium
          </Link>
          <div className="flex items-center gap-4">
            {onReset ? (
              <Button variant="text" size="sm" onClick={onReset}>
                Reiniciar
              </Button>
            ) : null}
            <MobileMenu />
          </div>
        </Container>
      </header>
      <main>
        <Container className="py-10 sm:py-14 lg:py-16">{children}</Container>
      </main>
    </div>
  );
}
