"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";
import {
  buildDiagnosticResult,
  isCompletedDiagnostic,
} from "@/domain/diagnostic/results";
import type { DiagnosticState } from "@/domain/diagnostic/types";
import {
  clearDiagnosticSession,
  loadDiagnosticSession,
  saveDiagnosticSession,
} from "@/lib/session";

import { OpportunityCard } from "./opportunity-card";

type LoadedSession = DiagnosticState | null | undefined;

export function ResultShell() {
  const [session, setSession] = useState<LoadedSession>(undefined);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadDiagnosticSession();
      setSession(stored && isCompletedDiagnostic(stored) ? stored : null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (session !== undefined) headingRef.current?.focus();
  }, [session]);

  const result = useMemo(
    () => (session ? buildDiagnosticResult(session) : undefined),
    [session],
  );

  if (session === undefined) {
    return (
      <main className="min-h-[60vh] bg-offwhite">
        <Container className="py-16 sm:py-24">
          <p role="status" className="text-body text-gray-text">
            Preparando seu diagnóstico…
          </p>
        </Container>
      </main>
    );
  }

  if (!session || !result) {
    return <EmptyResult headingRef={headingRef} />;
  }

  const prepareReview = () => {
    saveDiagnosticSession({
      ...session,
      stage: "questions",
      currentQuestionId: "Q001",
    });
  };

  const restart = () => clearDiagnosticSession();

  return (
    <main id="conteudo" className="bg-offwhite text-navy-950">
      <section className="border-b border-navy-950/10">
        <Container className="py-14 sm:py-20 lg:py-24">
          <Eyebrow>Resultado do diagnóstico</Eyebrow>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-5 max-w-4xl text-h1 font-semibold focus-visible:outline-none focus-visible:shadow-none"
          >
            Onde a tecnologia merece ser investigada primeiro.
          </h1>
          <p className="mt-6 max-w-3xl text-body-lg text-gray-text">
            Esta leitura organiza sinais das suas respostas. Ela indica frentes
            para aprofundar — não substitui o entendimento do processo nem
            promete um resultado fechado.
          </p>

          {result.context.length > 0 ? (
            <dl className="mt-9 grid max-w-4xl gap-px border border-navy-950/10 bg-navy-950/10 sm:grid-cols-3">
              {result.context.map((item) => (
                <div key={item.label} className="bg-offwhite px-5 py-4">
                  <dt className="text-caption font-bold tracking-wide text-gray-text uppercase">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-body font-semibold text-navy-950">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Container>
      </section>

      <section aria-labelledby="opportunities-title">
        <Container className="py-14 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-eyebrow font-bold tracking-[0.14em] text-navy-800 uppercase">
              Leitura priorizada
            </p>
            <h2 id="opportunities-title" className="mt-4 text-h2 font-semibold">
              {result.opportunities.length > 0
                ? "Oportunidades para explorar"
                : "Ainda não há uma prioridade clara"}
            </h2>
            <p className="mt-5 text-body-lg text-gray-text">
              {result.interpretation}
            </p>
          </div>

          {result.opportunities.length > 0 ? (
            <div className="mt-12 sm:mt-16">
              {result.opportunities.map((opportunity, index) => (
                <OpportunityCard
                  key={opportunity.dimension}
                  opportunity={opportunity}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 max-w-3xl border-l-2 border-gold-500 bg-white px-6 py-6">
              <p className="text-body text-navy-800">
                Se preferir, revise as respostas com exemplos mais concretos da
                rotina. O diagnóstico não preencherá lacunas com recomendações
                genéricas.
              </p>
            </div>
          )}

          {result.aiGuidance ? (
            <aside className="mt-10 max-w-4xl border border-navy-950/12 bg-white p-6 sm:p-8">
              <p className="text-caption font-bold tracking-wide text-navy-950 uppercase">
                Sobre inteligência artificial
              </p>
              <p className="mt-3 text-body text-gray-text">
                {result.aiGuidance}
              </p>
            </aside>
          ) : null}
        </Container>
      </section>

      <section className="bg-navy-950 text-offwhite">
        <Container className="py-14 sm:py-20 lg:py-24">
          <div className="grid gap-9 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-14">
            <div className="max-w-3xl">
              <Eyebrow tone="dark">Próximo passo</Eyebrow>
              <h2 className="mt-5 text-h2 font-semibold">
                Transforme sinais em um plano de investigação.
              </h2>
              <p className="mt-5 max-w-2xl text-body-lg text-offwhite/70">
                Um diagnóstico inicial ganha valor quando encontra o processo
                real, suas exceções e uma medida simples de sucesso.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <LinkButton href="/contato" variant="accent" size="lg">
                Quero conversar sobre isso
              </LinkButton>
              <LinkButton
                href="/diagnostico"
                variant="outlineDark"
                onClick={prepareReview}
              >
                Revisar respostas
              </LinkButton>
            </div>
          </div>
          <div className="mt-10 border-t border-offwhite/12 pt-7">
            <LinkButton
              href="/diagnostico"
              variant="outlineDark"
              size="sm"
              onClick={restart}
            >
              Recomeçar diagnóstico
            </LinkButton>
          </div>
        </Container>
      </section>
    </main>
  );
}

function EmptyResult({
  headingRef,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <main id="conteudo" className="min-h-[65vh] bg-offwhite text-navy-950">
      <Container className="py-16 sm:py-24 lg:py-28">
        <div className="max-w-3xl">
          <Eyebrow>Resultado do diagnóstico</Eyebrow>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-5 text-h1 font-semibold focus-visible:outline-none focus-visible:shadow-none"
          >
            Conclua o diagnóstico para ver suas oportunidades.
          </h1>
          <p className="mt-6 max-w-2xl text-body-lg text-gray-text">
            Não encontramos uma sessão concluída neste navegador. Suas respostas
            precisam ser finalizadas antes que qualquer recomendação seja
            gerada.
          </p>
          <LinkButton href="/diagnostico" size="lg" className="mt-9">
            Fazer diagnóstico
            <span aria-hidden="true">→</span>
          </LinkButton>
        </div>
      </Container>
    </main>
  );
}
