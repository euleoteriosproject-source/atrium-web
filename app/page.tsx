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
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";
import { SectionHeader } from "@/components/ui/section-header";
import { TextLink } from "@/components/ui/text-link";
import {
  caseAfter,
  caseBefore,
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
      <main>
        <Section
          background="dark"
          spacing="spacious"
          className="relative overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 h-px w-2/5 bg-accent-on-dark/55"
          />
          <Container className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <Eyebrow tone="dark">
                Software, automação e IA aplicada à operação.
              </Eyebrow>
              <h1 className="mt-6 max-w-3xl text-display font-semibold">
                Sua empresa pode trabalhar melhor.
              </h1>
              <p className="mt-7 max-w-2xl text-body-lg text-offwhite/75">
                Transformamos processos manuais, ferramentas desconectadas e
                oportunidades perdidas em soluções digitais que ajudam sua
                empresa a operar melhor e crescer.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <LinkButton href="/diagnostico" variant="accent" size="lg">
                  Descobrir oportunidades
                  <span aria-hidden="true">→</span>
                </LinkButton>
                <LinkButton href="/contato" variant="outlineDark" size="lg">
                  Tenho um projeto em mente
                </LinkButton>
              </div>
              <p className="mt-8 max-w-xl border-l border-accent-on-dark/65 pl-4 text-body-sm text-offwhite/60">
                Site, sistema, automação ou IA? Primeiro entendemos o problema.
                Depois escolhemos a tecnologia.
              </p>
            </div>
            <HeroOperationalFlow />
          </Container>
        </Section>

        <Section background="muted">
          <Container>
            <SectionHeader
              eyebrow="Rotina operacional"
              title="Quanto trabalho da sua empresa ainda depende de alguém fazer tudo manualmente?"
              description="Pequenos atritos repetidos todos os dias viram horas de trabalho, atrasos, erros e oportunidades perdidas."
            />
            <ul className="mt-14 grid border-t border-l border-navy-950/12 sm:grid-cols-2 lg:grid-cols-5">
              {painPoints.map((pain, index) => (
                <li
                  key={pain}
                  className="group motion-section min-h-44 border-r border-b border-navy-950/12 bg-offwhite p-5 transition-[background-color,color] hover:bg-navy-950 hover:text-offwhite sm:p-6"
                >
                  <span className="text-caption font-bold text-gray-text group-hover:text-brand-blue-deep">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <blockquote className="mt-7 text-body font-semibold">
                    “{pain}”
                  </blockquote>
                </li>
              ))}
            </ul>
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
              Fazer diagnóstico
              <span aria-hidden="true">→</span>
            </LinkButton>
          </Container>
        </Section>

        <Section>
          <Container>
            <SectionHeader
              eyebrow="Transformação"
              title="Hoje → uma operação melhor."
            />
            <div className="mt-14">
              <OperationComparison />
            </div>
            <p className="mx-auto mt-12 max-w-4xl text-center font-serif text-h3">
              Tecnologia não precisa substituir pessoas. Ela deve eliminar
              aquilo que impede as pessoas de fazer um trabalho melhor.
            </p>
          </Container>
        </Section>

        <Section id="solucoes" background="muted" className="scroll-mt-20">
          <Container>
            <SectionHeader
              eyebrow="Soluções Atrium"
              title="A solução depende do problema — não do nosso catálogo."
            />
            <div className="mt-14 border-t border-navy-950/15">
              {solutionPillars.map((solution) => (
                <article
                  key={solution.title}
                  className="grid gap-6 border-b border-navy-950/15 py-8 sm:py-10 lg:grid-cols-[4rem_1.05fr_0.95fr_auto] lg:items-start lg:gap-8"
                >
                  <span className="text-caption font-bold text-gray-text">
                    {solution.index}
                  </span>
                  <div>
                    <h3 className="text-h3 font-semibold">{solution.title}</h3>
                    <p className="mt-4 max-w-xl text-body text-gray-text">
                      {solution.proposition}
                    </p>
                  </div>
                  <ul
                    className="flex flex-wrap gap-2"
                    aria-label="Resultados possíveis"
                  >
                    {solution.outcomes.map((outcome) => (
                      <li
                        key={outcome}
                        className="rounded-full border border-navy-950/12 bg-offwhite px-3 py-1.5 text-caption font-semibold text-gray-text"
                      >
                        {outcome}
                      </li>
                    ))}
                  </ul>
                  <TextLink
                    href={solution.href}
                    className="justify-self-start whitespace-nowrap lg:justify-self-end"
                  >
                    Conhecer solução <span aria-hidden="true">→</span>
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
              Quero descobrir oportunidades
              <span aria-hidden="true">→</span>
            </LinkButton>
          </Container>
        </Section>

        <Section>
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
          background="muted"
          className="scroll-mt-20"
        >
          <Container>
            <SectionHeader
              eyebrow="Como trabalhamos"
              title="Começar pequeno, provar valor e escalar com controle."
            />
            <ol className="mt-14 grid border-t border-l border-navy-950/15 md:grid-cols-2 xl:grid-cols-4">
              {workSteps.map((step) => (
                <li
                  key={step.index}
                  className="min-h-64 border-r border-b border-navy-950/15 bg-offwhite p-7 sm:p-8"
                >
                  <span className="text-caption font-bold text-gray-text">
                    {step.index}
                  </span>
                  <h3 className="mt-10 text-h4 font-semibold">{step.title}</h3>
                  <p className="mt-4 text-body text-gray-text">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </Container>
        </Section>

        <Section id="case" className="scroll-mt-20">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
              <div>
                <Badge variant="accent">Primeiro caso Atrium</Badge>
                <h2 className="mt-5 text-h2 font-semibold">
                  De conversas desestruturadas para uma jornada organizada.
                </h2>
                <TextLink href="/cases/cred-marvi" className="mt-7 inline-flex">
                  Conhecer o caso <span aria-hidden="true">→</span>
                </TextLink>
                <TextLink
                  href="https://credmarvi.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="subtle"
                  className="mt-4 inline-flex"
                >
                  Ver projeto publicado <span aria-hidden="true">↗</span>
                </TextLink>
              </div>
              <div className="grid overflow-hidden rounded-card border border-navy-950/12 shadow-card sm:grid-cols-2">
                <div className="bg-gray-bg p-7 sm:p-8">
                  <p className="text-eyebrow font-bold tracking-[0.14em] text-gray-text uppercase">
                    Antes
                  </p>
                  <ul className="mt-7 space-y-4">
                    {caseBefore.map((item) => (
                      <li key={item} className="flex gap-3 text-body">
                        <span aria-hidden="true" className="text-navy-950/35">
                          —
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-navy-950 p-7 text-offwhite sm:p-8">
                  <p className="text-eyebrow font-bold tracking-[0.14em] text-accent-on-dark uppercase">
                    Abordagem Atrium
                  </p>
                  <ul className="mt-7 space-y-4">
                    {caseAfter.map((item) => (
                      <li key={item} className="flex gap-3 text-body">
                        <span
                          aria-hidden="true"
                          className="text-accent-on-dark"
                        >
                          +
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section background="dark">
          <Container>
            <SectionHeader
              eyebrow="Segurança e responsabilidade"
              title="Tecnologia também é confiança."
              className="[&_h2]:text-offwhite [&_p]:text-offwhite/80"
            />
            <div className="mt-14 grid border-t border-l border-offwhite/15 sm:grid-cols-2 xl:grid-cols-4">
              {trustPrinciples.map((principle, index) => (
                <article
                  key={principle.title}
                  className="min-h-60 border-r border-b border-offwhite/15 p-7 sm:p-8"
                >
                  <span className="text-caption font-bold text-accent-on-dark">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-8 text-h4 font-semibold">
                    {principle.title}
                  </h3>
                  <p className="mt-4 text-body-sm text-offwhite/65">
                    {principle.description}
                  </p>
                </article>
              ))}
            </div>
          </Container>
        </Section>

        <Section id="sobre" className="scroll-mt-20">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
              <div className="flex min-h-80 items-end rounded-card border border-navy-950/12 bg-navy-950 p-7 text-offwhite shadow-card sm:p-9">
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

        <Section background="muted">
          <Container className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
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

        <Section>
          <Container className="grid gap-12 lg:grid-cols-[0.6fr_1.4fr] lg:gap-20">
            <SectionHeader eyebrow="FAQ" title="Perguntas frequentes" />
            <Faq />
          </Container>
        </Section>

        <Section background="light">
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
                  Descobrir oportunidades
                  <span aria-hidden="true">→</span>
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
