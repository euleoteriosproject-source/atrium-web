import type { Metadata } from "next";

import { DemoInterestForm } from "@/components/demonstrations/demo-interest-form";
import { InstitutionalHero } from "@/components/institutional/institutional-hero";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Section } from "@/components/layout/section";
import { ProjectPreview } from "@/components/projects/project-preview";
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

        <Section id="auto-center" background="warm" className="scroll-mt-24">
          <Container>
            <div className="grid items-start gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
              <div>
                <Badge variant="accent">Demonstração Atrium</Badge>
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
                    size="lg"
                  >
                    Explorar demonstração{" "}
                    <span aria-hidden="true" className="editorial-arrow">
                      →
                    </span>
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

              <div>
                <ProjectPreview
                  src="/projects/auto-center-preview.png"
                  alt="Página inicial da demonstração Atrium para oficinas e auto centers"
                  href="https://atrium-auto-center.netlify.app/"
                  priority
                />
                <p className="mt-5 text-caption text-gray-text">
                  Auto Center — Atrium Conversão · experiência pública navegável
                </p>
              </div>
            </div>

            <div className="mt-16 grid gap-8 border-t border-navy-950/12 pt-10 lg:grid-cols-[0.72fr_1.28fr]">
              <h3 className="text-h3 font-semibold">O que ela demonstra</h3>
              <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {demonstratedCapabilities.map((capability) => (
                  <p
                    key={capability}
                    className="flex gap-3 border-b border-navy-950/10 pb-4 text-body text-gray-text"
                  >
                    <span aria-hidden="true" className="text-brand-blue">
                      +
                    </span>
                    {capability}
                  </p>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section
          id="interesse-auto-center"
          background="mist"
          className="scroll-mt-24"
        >
          <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeader
              eyebrow="Próximo passo"
              title="Leve o contexto certo para a primeira conversa."
              description="Você já escolheu a demonstração. Agora só precisamos de contexto suficiente para iniciar a conversa."
            />
            <div className="rounded-[1rem] border border-navy-950/10 bg-surface-white p-6 shadow-[var(--shadow-project)] sm:p-9">
              <DemoInterestForm />
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
