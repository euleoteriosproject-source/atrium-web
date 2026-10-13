import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/ui/section-header";
import type { SolutionDefinition } from "@/content/solutions";
import { buildDiagnosticHref } from "@/domain/diagnostic/preselection";

import { DiagnosticCta } from "./diagnostic-cta";
import { InstitutionalHero } from "./institutional-hero";

type SolutionDetailPageProps = Readonly<{
  solution: SolutionDefinition;
}>;

const process = [
  [
    "01",
    "Entendemos",
    "Mapeamos contexto, pessoas, dados, exceções e objetivo.",
  ],
  [
    "02",
    "Delimitamos",
    "Escolhemos a menor intervenção capaz de provar valor.",
  ],
  [
    "03",
    "Construímos",
    "Implementamos com qualidade, clareza e integração ao processo.",
  ],
  [
    "04",
    "Evoluímos",
    "Observamos o uso real antes de ampliar escopo ou complexidade.",
  ],
] as const;

export function SolutionDetailPage({ solution }: SolutionDetailPageProps) {
  const diagnosticHref = buildDiagnosticHref({ goal: solution.goal });

  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <main id="conteudo">
        <InstitutionalHero
          eyebrow={solution.eyebrow}
          title={solution.title}
          description={solution.summary}
          primaryHref={diagnosticHref}
          primaryLabel={solution.cta}
          secondaryHref="/solucoes"
          secondaryLabel="Ver todas as soluções"
        />

        <Section>
          <Container className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <SectionHeader
              eyebrow="O problema"
              title="Sinais que merecem investigação"
            />
            <div>
              <p className="max-w-3xl text-body-lg text-gray-text">
                {solution.problem}
              </p>
              <ul className="mt-9 grid border-t border-l border-navy-950/12 sm:grid-cols-2">
                {solution.signs.map((sign, index) => (
                  <li
                    key={sign}
                    className="min-h-36 border-r border-b border-navy-950/12 p-6"
                  >
                    <span className="text-caption font-bold text-gray-text">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-5 text-body font-semibold">{sign}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </Section>

        <Section background="muted">
          <Container>
            <SectionHeader
              eyebrow="Situações práticas"
              title="Onde essa solução pode entrar na operação"
              description="Exemplos ajudam a reconhecer possibilidades, mas o desenho final depende do processo real."
            />
            <ul className="mt-12 grid gap-px bg-navy-950/12 md:grid-cols-2 lg:grid-cols-3">
              {solution.situations.map((situation) => (
                <li
                  key={situation}
                  className="bg-offwhite p-7 text-body font-semibold"
                >
                  {situation}
                </li>
              ))}
            </ul>
          </Container>
        </Section>

        <Section>
          <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeader
                eyebrow="O que podemos fazer"
                title="Tecnologia proporcional ao problema"
              />
              <ul className="mt-9 space-y-4">
                {solution.capabilities.map((capability) => (
                  <li key={capability} className="flex gap-4 text-body">
                    <span aria-hidden="true" className="text-accent-strong">
                      +
                    </span>
                    {capability}
                  </li>
                ))}
              </ul>
            </div>
            <aside className="border border-navy-950/12 bg-gray-bg p-7 sm:p-9">
              <p className="text-eyebrow font-bold tracking-[0.14em] text-navy-800 uppercase">
                Menor solução útil
              </p>
              <h2 className="mt-5 text-h3 font-semibold">
                {solution.smallerOption.title}
              </h2>
              <p className="mt-5 text-body text-gray-text">
                {solution.smallerOption.description}
              </p>
              <p className="mt-8 border-t border-navy-950/12 pt-6 text-body font-semibold">
                Resultado buscado: {solution.outcome}
              </p>
            </aside>
          </Container>
        </Section>

        <Section background="dark">
          <Container>
            <SectionHeader
              eyebrow="Como trabalhamos"
              title="Clareza antes de complexidade."
              className="[&_h2]:text-offwhite"
            />
            <ol className="mt-12 grid border-t border-l border-offwhite/15 sm:grid-cols-2 xl:grid-cols-4">
              {process.map(([index, title, description]) => (
                <li
                  key={index}
                  className="border-r border-b border-offwhite/15 p-7"
                >
                  <span className="text-caption font-bold text-accent-on-dark">
                    {index}
                  </span>
                  <h3 className="mt-7 text-h4 font-semibold">{title}</h3>
                  <p className="mt-4 text-body-sm text-offwhite/65">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-12 max-w-3xl border-l border-accent-strong/60 pl-6">
              <h2 className="text-h3 font-semibold">{solution.trust.title}</h2>
              <p className="mt-4 text-body text-offwhite/70">
                {solution.trust.description}
              </p>
            </div>
          </Container>
        </Section>

        <DiagnosticCta href={diagnosticHref} label={solution.cta} />
      </main>
      <Footer />
    </div>
  );
}
