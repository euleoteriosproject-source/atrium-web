import type { Metadata } from "next";

import { DiagnosticCta } from "@/components/institutional/diagnostic-cta";
import { InstitutionalHero } from "@/components/institutional/institutional-hero";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Section } from "@/components/layout/section";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { solutions } from "@/content/solutions";
import { buildDiagnosticHref } from "@/domain/diagnostic/preselection";

export const metadata: Metadata = {
  title: "Soluções",
  description:
    "Sites, automações, integrações, sistemas sob medida e IA aplicada a problemas reais da operação.",
  alternates: { canonical: "/solucoes" },
};

const solutionAnchors = {
  "sites-e-portais": "sites-e-experiencias",
  "automacoes-e-integracoes": "automacoes-e-integracoes",
  "sistemas-sob-medida": "sistemas-sob-medida",
  "ia-aplicada": "ia-aplicada",
} as const;

const scenarios = [
  ["Quero melhorar minha presença digital", "sites-e-experiencias"],
  ["Quero reduzir trabalho manual", "automacoes-e-integracoes"],
  ["Preciso organizar melhor um processo", "sistemas-sob-medida"],
  ["Quero avaliar onde IA faz sentido", "ia-aplicada"],
] as const;

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <main id="conteudo">
        <InstitutionalHero
          eyebrow="Soluções Atrium"
          title="Tecnologia certa para o problema certo."
          description="Sites, automações, sistemas e IA entram quando ajudam a resolver uma necessidade real — e na medida certa para a operação."
          primaryHref="/diagnostico"
          primaryLabel="Diagnóstico gratuito"
          secondaryHref="/contato"
          secondaryLabel="Conversar sobre uma ideia"
          compact
        />

        <Section background="warm" spacing="compact">
          <Container>
            <Eyebrow>Encontre seu cenário</Eyebrow>
            <h2 className="mt-4 text-h3 font-semibold">
              O que você quer melhorar primeiro?
            </h2>
            <nav aria-label="Atalhos para soluções" className="mt-8">
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {scenarios.map(([label, id], index) => (
                  <li
                    key={id}
                    className="group bg-surface-white shadow-[0_1px_0_rgb(7_24_50_/_0.08)]"
                  >
                    <a
                      href={`#${id}`}
                      className="motion-interactive flex min-h-36 flex-col justify-between gap-6 border-t-2 border-transparent p-5 font-semibold transition-[background-color,color,border-color,transform] hover:-translate-y-0.5 hover:border-brand-blue hover:bg-surface-mist sm:p-6"
                    >
                      <span className="text-caption text-gray-text">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex items-end justify-between gap-4 text-body">
                        {label}
                        <span aria-hidden="true">↓</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Container>
        </Section>

        <Section background="white">
          <Container>
            <div className="space-y-8">
              {solutions.map((solution) => (
                <article
                  key={solution.slug}
                  id={solutionAnchors[solution.slug]}
                  className="scroll-mt-24 border-t border-navy-950/15 py-14 first:border-t-0 first:pt-0"
                >
                  <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
                    <div>
                      <span className="text-caption font-bold text-gray-text">
                        {solution.index}
                      </span>
                      <h2 className="mt-4 text-h3 font-semibold">
                        {solution.eyebrow}
                      </h2>
                      <p className="mt-5 text-body text-gray-text">
                        {solution.problem}
                      </p>
                    </div>
                    <div className="border-l-2 border-accent-strong bg-surface-mist p-6 sm:p-8">
                      <p className="text-caption font-bold tracking-wide text-navy-800 uppercase">
                        Resultado buscado
                      </p>
                      <p className="mt-4 max-w-3xl text-body-lg font-semibold text-navy-950">
                        {solution.outcome}
                      </p>
                    </div>
                  </div>

                  <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:ml-[calc(36%+2rem)]">
                    <div>
                      <h3 className="text-h4 font-semibold">Sinais comuns</h3>
                      <ul className="mt-5 space-y-3 text-body text-gray-text">
                        {solution.signs.slice(0, 3).map((sign) => (
                          <li key={sign} className="flex gap-3">
                            <span
                              aria-hidden="true"
                              className="text-brand-blue"
                            >
                              —
                            </span>
                            {sign}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-h4 font-semibold">Exemplos</h3>
                      <ul className="mt-5 space-y-3 text-body text-gray-text">
                        {solution.situations.slice(0, 3).map((situation) => (
                          <li key={situation} className="flex gap-3">
                            <span
                              aria-hidden="true"
                              className="text-brand-blue"
                            >
                              +
                            </span>
                            {situation}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-4 border-t border-navy-950/12 pt-6 sm:col-span-2 sm:flex-row sm:flex-wrap sm:items-center">
                      <TextLink href={`/solucoes/${solution.slug}`}>
                        Entender esta solução <span aria-hidden="true">→</span>
                      </TextLink>
                      <span
                        aria-hidden="true"
                        className="hidden text-navy-950/25 sm:block"
                      >
                        /
                      </span>
                      <TextLink
                        href={buildDiagnosticHref({ goal: solution.goal })}
                      >
                        Diagnóstico gratuito
                      </TextLink>
                      {solution.slug === "sites-e-portais" ? (
                        <>
                          <span
                            aria-hidden="true"
                            className="hidden text-navy-950/25 sm:block"
                          >
                            /
                          </span>
                          <TextLink href="/demonstracoes#auto-center">
                            Ver demonstração Auto Center{" "}
                            <span aria-hidden="true">→</span>
                          </TextLink>
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </Section>

        <DiagnosticCta href="/diagnostico" />
      </main>
      <Footer />
    </div>
  );
}
