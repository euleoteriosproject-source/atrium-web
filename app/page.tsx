import type { Metadata } from "next";

import { Faq } from "@/components/home/faq";
import { ManualWorkCalculator } from "@/components/home/manual-work-calculator";
import {
  HeroOperationalFlow,
  OperationComparison,
} from "@/components/home/operational-flow";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Section } from "@/components/layout/section";
import { ProjectPreview } from "@/components/projects/project-preview";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";
import { SectionHeader } from "@/components/ui/section-header";
import { TextLink } from "@/components/ui/text-link";
import {
  founderSignals,
  painPoints,
  solutionPillars,
  trustPrinciples,
  workSteps,
} from "@/content/home";

export const metadata: Metadata = {
  title: {
    absolute: "Atrium — Tecnologia que transforma operação em resultado",
  },
  description:
    "A Atrium transforma processos manuais, ferramentas desconectadas e oportunidades perdidas em soluções digitais para sua empresa operar melhor.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="conteudo">
        <Section
          background="dark"
          spacing="spacious"
          className="relative overflow-hidden pb-32 sm:pb-40 lg:pb-48"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-on-dark/70 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute -right-40 -bottom-72 size-[36rem] rounded-full border border-brand-cyan/10"
          />
          <Container className="relative grid items-center gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
            <div>
              <Eyebrow tone="dark">
                Software, automação e IA aplicada à operação.
              </Eyebrow>
              <h1 className="mt-7 max-w-4xl text-display font-semibold">
                Sua empresa pode trabalhar melhor.
              </h1>
              <p className="mt-8 max-w-2xl text-body-lg text-offwhite/72">
                Transformamos processos manuais, ferramentas desconectadas e
                oportunidades perdidas em soluções digitais que ajudam sua
                empresa a operar melhor e crescer.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <LinkButton href="/diagnostico" variant="accent" size="lg">
                  Descobrir oportunidades
                  <span aria-hidden="true" className="editorial-arrow">
                    →
                  </span>
                </LinkButton>
                <LinkButton href="/contato" variant="outlineDark" size="lg">
                  Tenho um projeto em mente
                </LinkButton>
              </div>
              <p className="mt-10 max-w-xl border-l border-accent-on-dark/65 pl-5 text-body-sm text-offwhite/58">
                Site, sistema, automação ou IA? Primeiro entendemos o problema.
                Depois escolhemos a tecnologia.
              </p>
            </div>
            <HeroOperationalFlow />
          </Container>
        </Section>

        <Section background="warm" className="relative">
          <Container>
            <div className="grid gap-8 border-b border-navy-950/12 pb-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <Eyebrow>Trabalho em produção</Eyebrow>
                <h2 className="mt-5 max-w-xl text-h2 font-semibold">
                  Prova real antes da promessa.
                </h2>
              </div>
              <p className="max-w-2xl justify-self-end font-serif text-h4 text-navy-800">
                Experiências digitais construídas para organizar contexto,
                transmitir confiança e preparar conversas melhores.
              </p>
            </div>

            <article className="mt-14 grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
              <ProjectPreview
                src="/projects/cred-marvi-preview.png"
                alt="Página inicial publicada da Cred Marvi, com jornada de soluções de crédito e atendimento humano"
                href="https://credmarvi.netlify.app/"
                external
                priority
              />
              <div className="lg:py-8">
                <Badge variant="accent">Projeto publicado</Badge>
                <p className="mt-6 text-caption font-bold tracking-[0.14em] text-gray-text uppercase">
                  Cred Marvi
                </p>
                <h3 className="mt-3 text-h3 font-semibold">
                  De conversas desestruturadas para uma jornada organizada.
                </h3>
                <p className="mt-5 text-body text-gray-text">
                  Uma experiência que reúne contexto e consentimento antes do
                  handoff humano, sem tirar da conversa a responsabilidade pela
                  decisão.
                </p>
                <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-7">
                  <TextLink href="/cases/cred-marvi">
                    Conhecer o caso{" "}
                    <span aria-hidden="true" className="editorial-arrow">
                      →
                    </span>
                  </TextLink>
                  <TextLink
                    href="https://credmarvi.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver projeto publicado <span aria-hidden="true">↗</span>
                  </TextLink>
                </div>
              </div>
            </article>

            <article className="mt-20 grid items-center gap-9 border-t border-navy-950/12 pt-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
              <div>
                <p className="text-eyebrow font-bold tracking-[0.14em] text-brand-blue-deep uppercase">
                  Demonstração Atrium
                </p>
                <h3 className="mt-4 text-h3 font-semibold">
                  Auto Center — Atrium Conversão
                </h3>
                <p className="mt-5 max-w-xl text-body text-gray-text">
                  Uma demonstração comercial de como presença digital e uma
                  jornada guiada podem preparar melhor o atendimento.
                </p>
                <TextLink
                  href="/demonstracoes#auto-center"
                  className="mt-7 inline-flex"
                >
                  Explorar demonstração{" "}
                  <span aria-hidden="true" className="editorial-arrow">
                    →
                  </span>
                </TextLink>
              </div>
              <ProjectPreview
                src="/projects/auto-center-preview.png"
                alt="Página inicial da demonstração Atrium para oficinas e auto centers"
                href="/demonstracoes#auto-center"
              />
            </article>
          </Container>
        </Section>

        <Section background="white">
          <Container className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <SectionHeader
              eyebrow="Rotina operacional"
              title="O trabalho invisível também custa tempo."
              description="Pequenos atritos repetidos todos os dias viram horas de trabalho, atrasos, erros e oportunidades perdidas."
            />
            <ol className="border-t border-navy-950/14">
              {painPoints.slice(0, 5).map((pain, index) => (
                <li
                  key={pain}
                  className="grid grid-cols-[3rem_1fr] gap-4 border-b border-navy-950/12 py-5 sm:grid-cols-[4rem_1fr] sm:py-6"
                >
                  <span className="text-caption font-bold text-brand-blue-deep">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <blockquote className="max-w-xl text-body font-semibold">
                    “{pain}”
                  </blockquote>
                </li>
              ))}
            </ol>
          </Container>
        </Section>

        <Section background="dark" spacing="compact">
          <Container className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <h2 className="text-h3 font-semibold">
                Descubra onde a tecnologia poderia trabalhar pela sua empresa.
              </h2>
              <p className="mt-4 text-body text-offwhite/70">
                Responda algumas perguntas sobre sua operação e receba um mapa
                inicial das oportunidades que mais vale investigar.
              </p>
              <p className="mt-3 text-body-sm text-offwhite/55">
                Leva poucos minutos. Sem compromisso. Sem precisar saber qual
                tecnologia você precisa.
              </p>
            </div>
            <LinkButton
              href="/diagnostico"
              variant="accent"
              className="justify-self-start"
            >
              Fazer diagnóstico{" "}
              <span aria-hidden="true" className="editorial-arrow">
                →
              </span>
            </LinkButton>
          </Container>
        </Section>

        <Section background="mist">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <SectionHeader
                eyebrow="Transformação"
                title="Hoje → uma operação melhor."
              />
              <p className="max-w-2xl justify-self-end font-serif text-h4 text-navy-800">
                Tecnologia não precisa substituir pessoas. Ela deve eliminar
                aquilo que impede as pessoas de fazer um trabalho melhor.
              </p>
            </div>
            <div className="mt-14">
              <OperationComparison />
            </div>
          </Container>
        </Section>

        <Section id="solucoes" background="white" className="scroll-mt-20">
          <Container>
            <SectionHeader
              eyebrow="Soluções Atrium"
              title="A solução depende do problema — não do nosso catálogo."
            />
            <div className="mt-14 border-t border-navy-950/15">
              {solutionPillars.map((solution, index) => (
                <article
                  key={solution.title}
                  className={`group grid gap-6 border-b border-navy-950/15 py-9 sm:py-11 lg:grid-cols-[4rem_1.1fr_0.9fr_auto] lg:items-start lg:gap-8 ${index % 2 === 1 ? "lg:pl-10" : ""}`}
                >
                  <span className="text-caption font-bold text-brand-blue-deep">
                    {solution.index}
                  </span>
                  <div>
                    <h3 className="text-h3 font-semibold">{solution.title}</h3>
                    <p className="mt-4 max-w-xl text-body text-gray-text">
                      {solution.proposition}
                    </p>
                  </div>
                  <p className="max-w-sm text-body-sm text-gray-text">
                    {solution.outcomes.join(" · ")}
                  </p>
                  <TextLink
                    href={solution.href}
                    className="justify-self-start whitespace-nowrap lg:justify-self-end"
                  >
                    Conhecer solução{" "}
                    <span aria-hidden="true" className="editorial-arrow">
                      →
                    </span>
                  </TextLink>
                </article>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="dark" spacing="compact">
          <Container className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <Eyebrow tone="dark">Comece pelo problema</Eyebrow>
              <h2 className="mt-4 text-h2 font-semibold">
                Você não precisa saber qual tecnologia contratar.
              </h2>
              <p className="mt-5 text-body-lg text-offwhite/70">
                Explique o que incomoda na sua operação. Descobrir a solução é
                parte do nosso trabalho.
              </p>
            </div>
            <LinkButton
              href="/diagnostico?goal=DISCOVERY"
              variant="accent"
              className="justify-self-start"
            >
              Quero descobrir oportunidades{" "}
              <span aria-hidden="true" className="editorial-arrow">
                →
              </span>
            </LinkButton>
          </Container>
        </Section>

        <Section background="warm">
          <Container>
            <SectionHeader
              eyebrow="Calculadora"
              title="Quanto tempo uma tarefa repetitiva consome da sua equipe?"
              description="Faça uma estimativa rápida. Os valores ficam apenas nesta página e não são enviados."
            />
            <div className="mt-12">
              <ManualWorkCalculator />
            </div>
          </Container>
        </Section>

        <Section
          id="como-trabalhamos"
          background="white"
          className="scroll-mt-20"
        >
          <Container>
            <SectionHeader
              eyebrow="Como trabalhamos"
              title="Começar pequeno, provar valor e escalar com controle."
            />
            <ol className="relative mt-16 grid gap-0 border-l border-navy-950/16 md:grid-cols-4 md:border-t md:border-l-0">
              {workSteps.map((step) => (
                <li
                  key={step.index}
                  className="relative border-b border-navy-950/12 py-7 pl-8 last:border-b-0 md:border-r md:border-b-0 md:px-7 md:pt-11 md:pb-3 md:last:border-r-0"
                >
                  <span className="absolute top-8 -left-1.5 size-3 rounded-full border-2 border-white bg-brand-blue md:-top-1.5 md:left-7" />
                  <span className="text-caption font-bold text-brand-blue-deep">
                    {step.index}
                  </span>
                  <h3 className="mt-5 text-h4 font-semibold">{step.title}</h3>
                  <p className="mt-4 text-body-sm text-gray-text">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </Container>
        </Section>

        <Section background="dark">
          <Container className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <Eyebrow tone="dark">Segurança e responsabilidade</Eyebrow>
              <h2 className="mt-5 text-h2 font-semibold">
                Tecnologia também é confiança.
              </h2>
              <p className="mt-6 max-w-xl font-serif text-h4 text-offwhite/65">
                Decisões de arquitetura precisam sustentar a operação — não
                apenas a apresentação.
              </p>
            </div>
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {trustPrinciples.map((principle, index) => (
                <article
                  key={principle.title}
                  className="border-t border-offwhite/16 pt-6"
                >
                  <span className="text-caption font-bold text-accent-on-dark">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-h4 font-semibold">
                    {principle.title}
                  </h3>
                  <p className="mt-3 text-body-sm text-offwhite/62">
                    {principle.description}
                  </p>
                </article>
              ))}
            </div>
          </Container>
        </Section>

        <Section id="sobre" background="white" className="scroll-mt-20">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
              <div className="flex min-h-80 items-end rounded-[1rem] bg-navy-950 p-7 text-offwhite shadow-[var(--shadow-project)] sm:p-9">
                <div>
                  <span
                    aria-hidden="true"
                    className="font-serif text-display text-accent-on-dark"
                  >
                    VE
                  </span>
                  <p className="mt-5 text-h4 font-semibold">
                    Vinicius Euleoterio
                  </p>
                  <p className="mt-1 text-body-sm text-offwhite/65">
                    Founder & Software Engineer
                  </p>
                </div>
              </div>
              <div>
                <Eyebrow>Experiência</Eyebrow>
                <h2 className="mt-5 text-h2 font-semibold">
                  Tecnologia séria precisa de experiência por trás.
                </h2>
                <p className="mt-6 text-body-lg text-gray-text">
                  Mais de 8 anos de experiência em engenharia de software,
                  desenvolvimento backend, integrações e sistemas para ambientes
                  de alta criticidade, incluindo o setor financeiro.
                </p>
                <p className="mt-5 text-body text-gray-text">
                  A Atrium nasce da experiência de construir tecnologia que
                  precisa funcionar no mundo real — com segurança, manutenção,
                  integração e responsabilidade.
                </p>
                <dl className="mt-9 grid gap-x-8 gap-y-6 border-t border-navy-950/12 pt-7 sm:grid-cols-2">
                  {founderSignals.map(([term, description]) => (
                    <div key={term}>
                      <dt className="font-semibold">{term}</dt>
                      <dd className="mt-1 text-body-sm text-gray-text">
                        {description}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Container>
        </Section>

        <Section background="cyan">
          <Container className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <Eyebrow>Proporção</Eyebrow>
            <div>
              <h2 className="text-h2 font-semibold">
                Pode ser mais simples do que parece.
              </h2>
              <div className="mt-6 max-w-3xl space-y-4 text-body-lg text-gray-text">
                <p>Nem todo problema precisa de um sistema enorme.</p>
                <p>
                  Às vezes, um formulário bem desenhado resolve. Às vezes, uma
                  integração. Às vezes, uma automação. Às vezes, um software
                  inteiro.
                </p>
                <p className="font-semibold text-navy-950">
                  Nosso trabalho é descobrir a menor solução capaz de gerar
                  resultado.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        <Section background="white">
          <Container className="grid gap-12 lg:grid-cols-[0.6fr_1.4fr] lg:gap-20">
            <SectionHeader eyebrow="FAQ" title="Perguntas frequentes" />
            <Faq />
          </Container>
        </Section>

        <Section background="warm">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <Eyebrow className="justify-center">Próximo passo</Eyebrow>
              <h2 className="mt-6 text-h2 font-semibold">
                O que na sua empresa ainda deveria ser mais simples?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-gray-text">
                Conte como funciona hoje. Talvez exista uma maneira melhor.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <LinkButton href="/diagnostico" size="lg">
                  Descobrir oportunidades{" "}
                  <span aria-hidden="true" className="editorial-arrow">
                    →
                  </span>
                </LinkButton>
                <LinkButton
                  href="/contato/whatsapp"
                  variant="secondary"
                  size="lg"
                >
                  Conversar pelo WhatsApp
                </LinkButton>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
