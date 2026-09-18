"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";
import { trackLeadHandoff } from "@/domain/lead/client";
import { buildWhatsAppUrl } from "@/domain/lead/whatsapp";
import { loadLeadHandoff, type LeadHandoff } from "@/domain/lead/session";
import type { DiagnosticState } from "@/domain/diagnostic/types";
import { isCompletedDiagnostic } from "@/domain/diagnostic/results";
import { publicEnv } from "@/lib/env";
import { loadDiagnosticSession } from "@/lib/session";

type HandoffState =
  { diagnostic: DiagnosticState; handoff: LeadHandoff } | null | undefined;

export function WhatsAppHandoff() {
  const [state, setState] = useState<HandoffState>(undefined);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const diagnostic = loadDiagnosticSession();
      const handoff = loadLeadHandoff();
      setState(
        diagnostic && isCompletedDiagnostic(diagnostic) && handoff
          ? { diagnostic, handoff }
          : null,
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state !== undefined) headingRef.current?.focus();
  }, [state]);

  const whatsappUrl = useMemo(() => {
    if (!state || !publicEnv.NEXT_PUBLIC_WHATSAPP_NUMBER) return undefined;
    return buildWhatsAppUrl(publicEnv.NEXT_PUBLIC_WHATSAPP_NUMBER, {
      diagnostic: state.diagnostic,
      companyName: state.handoff.companyName,
      timeframe: state.handoff.timeframe,
      publicCode: state.handoff.publicCode,
    });
  }, [state]);

  function trackAfterNavigationStarts() {
    if (!state?.handoff.persisted || !state.handoff.publicCode) return;
    window.setTimeout(() => {
      void trackLeadHandoff(
        {
          submissionId: state.handoff.submissionId,
          publicCode: state.handoff.publicCode as string,
        },
        {
          supabaseUrl: publicEnv.NEXT_PUBLIC_SUPABASE_URL,
          publishableKey: publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        },
      );
    }, 0);
  }

  if (state === undefined) {
    return (
      <main className="min-h-[60vh] bg-offwhite">
        <Container className="py-16 sm:py-24">
          <p role="status" className="text-body text-gray-text">
            Preparando o WhatsApp…
          </p>
        </Container>
      </main>
    );
  }

  if (!state) {
    return (
      <main id="conteudo" className="min-h-[65vh] bg-offwhite text-navy-950">
        <Container className="py-16 sm:py-24 lg:py-28">
          <div className="max-w-3xl">
            <Eyebrow>Conversa com contexto</Eyebrow>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="mt-5 text-h1 font-semibold focus-visible:outline-none focus-visible:shadow-none"
            >
              Prepare seu diagnóstico antes de abrir o WhatsApp.
            </h1>
            <p className="mt-6 text-body-lg text-gray-text">
              Não encontramos um handoff válido nesta sessão.
            </p>
            <LinkButton href="/diagnostico" size="lg" className="mt-9">
              Fazer diagnóstico
            </LinkButton>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main id="conteudo" className="min-h-[65vh] bg-offwhite text-navy-950">
      <Container className="py-16 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <Eyebrow>
            {state.handoff.persisted
              ? "Diagnóstico recebido"
              : "Seu diagnóstico está preservado"}
          </Eyebrow>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-5 text-h1 font-semibold focus-visible:outline-none focus-visible:shadow-none"
          >
            Agora você pode continuar a conversa no WhatsApp.
          </h1>

          {state.handoff.persisted && state.handoff.publicCode ? (
            <div className="mt-8 border-l-2 border-gold-500 bg-white px-6 py-5">
              <p className="text-caption font-bold tracking-wide text-gray-text uppercase">
                Código do diagnóstico
              </p>
              <p className="mt-2 font-serif text-h3 text-navy-950">
                {state.handoff.publicCode}
              </p>
            </div>
          ) : (
            <p
              role="status"
              className="mt-8 border-l-2 border-gold-500 bg-white px-6 py-5 text-body text-navy-800"
            >
              Não conseguimos registrar seu diagnóstico agora, mas você ainda
              pode continuar a conversa pelo WhatsApp.
            </p>
          )}

          <p className="mt-7 max-w-2xl text-body-lg text-gray-text">
            A mensagem já leva um resumo das oportunidades, sem respostas
            completas, score interno ou dados desnecessários.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={trackAfterNavigationStarts}
                className="motion-interactive relative inline-flex min-h-15 items-center justify-center rounded-control border border-navy-950 bg-navy-950 px-8 text-body font-semibold text-offwhite transition-colors hover:bg-navy-800"
              >
                Abrir WhatsApp
              </a>
            ) : (
              <p role="alert" className="text-body text-gray-text">
                O canal de WhatsApp ainda não está configurado. Seu diagnóstico
                continua salvo nesta sessão.
              </p>
            )}
            <LinkButton
              href="/diagnostico/resultado"
              variant="secondary"
              size="lg"
            >
              Voltar ao resultado
            </LinkButton>
          </div>

          {!state.handoff.persisted ? (
            <p className="mt-7 text-body-sm text-gray-text">
              Você também pode{" "}
              <a
                href="/contato"
                className="font-semibold text-navy-950 underline decoration-gold-500 decoration-2 underline-offset-4"
              >
                tentar registrar novamente
              </a>
              .
            </p>
          ) : null}
        </div>
      </Container>
    </main>
  );
}
