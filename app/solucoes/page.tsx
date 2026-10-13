import type { Metadata } from "next";

import { DiagnosticCta } from "@/components/institutional/diagnostic-cta";
import { InstitutionalHero } from "@/components/institutional/institutional-hero";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Section } from "@/components/layout/section";
import { TextLink } from "@/components/ui/text-link";
import { solutions } from "@/content/solutions";
import { buildDiagnosticHref } from "@/domain/diagnostic/preselection";

export const metadata: Metadata = {
  title: "Soluções",
  description:
    "Sites, automações, integrações, sistemas sob medida e IA aplicada a problemas reais da operação.",
  alternates: { canonical: "/solucoes" },
};

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <main id="conteudo">
        <InstitutionalHero
          eyebrow="Soluções Atrium"
          title="Não vendemos tecnologia isolada. Combinamos o necessário para resolver o problema."
          description="A forma da solução depende da operação: às vezes uma jornada digital, uma integração ou uma automação resolve. Em outros casos, faz sentido construir software ou aplicar IA com controles claros."
          primaryHref="/diagnostico"
          primaryLabel="Diagnóstico gratuito"
          secondaryHref="/contato"
          secondaryLabel="Conversar sobre uma ideia"
        />

        <Section>
          <Container>
            <div className="space-y-8">
              {solutions.map((solution) => (
                <article
                  key={solution.slug}
                  className="grid gap-8 border-t border-navy-950/15 py-10 first:border-t-0 first:pt-0 lg:grid-cols-[0.55fr_1.45fr] lg:gap-16"
                >
                  <div>
                    <span className="text-caption font-bold text-gray-text">
                      {solution.index}
                    </span>
                    <h2 className="mt-4 text-h3 font-semibold">
                      {solution.eyebrow}
                    </h2>
                    <p className="mt-4 text-body text-gray-text">
                      {solution.problem}
                    </p>
                  </div>
                  <div className="grid gap-8 sm:grid-cols-2">
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
                    <div className="border-l border-accent-strong/60 pl-5 sm:col-span-2">
                      <p className="text-caption font-bold tracking-wide text-navy-800 uppercase">
                        Resultado buscado
                      </p>
                      <p className="mt-3 max-w-3xl text-body font-semibold">
                        {solution.outcome}
                      </p>
                    </div>
                    <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
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
