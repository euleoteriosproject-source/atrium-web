import type { Metadata } from "next";

import { DemoInterestForm } from "@/components/demonstrations/demo-interest-form";
import { InstitutionalHero } from "@/components/institutional/institutional-hero";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata: Metadata = {
  title: "Demonstrações",
  description:
    "Demonstrações de experiências digitais Atrium criadas para mostrar como presença digital, qualificação e atendimento podem trabalhar juntos.",
  alternates: { canonical: "/demonstracoes" },
};

const demonstratedCapabilities = [
  "Presença profissional responsiva",
  "Serviços, diferenciais e CTAs contextuais",
  "Jornada guiada de solicitação em cinco etapas",
  "Contexto do veículo e da necessidade",
  "Revisão antes da conclusão",
  "Prévia de handoff organizado",
] as const;

export default function DemonstrationsPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <main id="conteudo">
        <InstitutionalHero
          eyebrow="Demonstrações Atrium"
          title="Veja a experiência antes de conversar com a gente."
          description="Estas demonstrações mostram como uma jornada digital pode apresentar um negócio, organizar a necessidade do cliente e preparar melhor o atendimento."
          compact
        />

        <Section id="auto-center" className="scroll-mt-24">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
              <div>
                <Badge variant="accent">Auto Center · Atrium Conversão</Badge>
                <h2 className="mt-6 text-h2 font-semibold">
                  Uma experiência digital que começa antes do WhatsApp.
                </h2>
                <p className="mt-6 max-w-2xl text-body-lg text-gray-text">
                  Uma demonstração para oficinas e auto centers que combina
                  presença profissional com uma jornada guiada para organizar a
                  necessidade do motorista antes do atendimento.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <LinkButton
                    href="https://atrium-auto-center.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="lg"
                  >
                    Abrir demonstração <span aria-hidden="true">↗</span>
                  </LinkButton>
                  <LinkButton
                    href="#interesse-auto-center"
                    variant="secondary"
                    size="lg"
                  >
                    Quero algo assim para minha empresa
                  </LinkButton>
                </div>
                <p className="mt-7 border-l-2 border-accent-strong pl-5 text-body-sm text-gray-text">
                  Esta demonstração não representa uma oficina real e não envia
                  ou armazena os dados preenchidos.
                </p>
              </div>

              <div className="border border-navy-950/12 bg-gray-bg p-7 sm:p-9">
                <h3 className="text-h4 font-semibold">O que ela demonstra</h3>
                <ul className="mt-7 space-y-4 text-body text-gray-text">
                  {demonstratedCapabilities.map((capability) => (
                    <li key={capability} className="flex gap-3">
                      <span aria-hidden="true" className="text-brand-blue">
                        +
                      </span>
                      {capability}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </Section>

        <Section
          id="interesse-auto-center"
          background="muted"
          className="scroll-mt-24"
        >
          <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeader
              eyebrow="Próximo passo"
              title="Leve o contexto certo para a primeira conversa."
              description="Você já escolheu a demonstração. Agora só precisamos de contexto suficiente para iniciar a conversa."
            />
            <div className="border border-navy-950/12 bg-offwhite p-6 shadow-card sm:p-9">
              <DemoInterestForm />
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
