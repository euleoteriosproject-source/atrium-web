import type { Metadata } from "next";

import { BrandMark } from "@/components/brand";
import { DiagnosticCta } from "@/components/institutional/diagnostic-cta";
import { InstitutionalHero } from "@/components/institutional/institutional-hero";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça a Atrium: engenharia séria, entendimento operacional e tecnologia aplicada com clareza e responsabilidade.",
  alternates: { canonical: "/sobre" },
};

const principles = [
  [
    "Tecnologia honesta",
    "A solução deve servir ao problema, não justificar uma ferramenta.",
  ],
  [
    "Pequeno por escolha",
    "Começamos pela menor entrega capaz de provar valor real.",
  ],
  [
    "Segurança",
    "Acesso, privacidade e responsabilidade são decisões de arquitetura.",
  ],
  [
    "Transparência",
    "Limites, riscos e alternativas fazem parte da recomendação.",
  ],
  [
    "Humano onde importa",
    "Contexto, julgamento e relação não devem ser automatizados sem motivo.",
  ],
  [
    "Resultado acima do hype",
    "Preferimos uma solução simples que funciona a uma narrativa grandiosa.",
  ],
] as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <main id="conteudo">
        <InstitutionalHero
          eyebrow="Sobre a Atrium"
          title="Engenharia séria para problemas que existem no mundo real."
          description="A Atrium combina entendimento operacional, software, automação, integração e IA responsável para construir soluções proporcionais ao que uma empresa precisa melhorar."
          primaryHref="/diagnostico"
          primaryLabel="Diagnóstico gratuito"
          secondaryHref="/solucoes"
          secondaryLabel="Conhecer soluções"
        />

        <Section>
          <Container className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <SectionHeader
              eyebrow="Por que existimos"
              title="A operação não deveria se adaptar a toda limitação da ferramenta."
            />
            <div className="space-y-6 text-body-lg text-gray-text">
              <p>
                Empresas acumulam planilhas, mensagens e sistemas que resolvem
                partes do trabalho, mas nem sempre formam um processo coerente.
              </p>
              <p>
                A Atrium existe para entender onde esse atrito realmente importa
                e desenhar tecnologia que se adapte ao problema quando há valor
                em fazer isso.
              </p>
              <p className="font-semibold text-navy-950">
                Primeiro entendemos o problema. Depois escolhemos a tecnologia.
              </p>
            </div>
          </Container>
        </Section>

        <Section background="muted">
          <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeader
                eyebrow="O nome"
                title="Um espaço central de encontro e circulação."
              />
              <p className="mt-6 text-body text-gray-text">
                Na arquitetura, o átrio é um espaço de entrada, encontro e
                conexão. Como metáfora, representa o ponto em que pessoas,
                processos, sistemas e informação convergem para permitir uma
                decisão melhor.
              </p>
            </div>
            <div className="flex min-h-72 items-end bg-navy-950 p-8 text-offwhite sm:p-10">
              <blockquote className="font-serif text-h3">
                “Tecnologia que transforma operação em resultado.”
              </blockquote>
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <SectionHeader
              eyebrow="Princípios"
              title="Como escolhemos construir"
            />
            <dl className="mt-12 grid border-t border-l border-navy-950/12 sm:grid-cols-2 lg:grid-cols-3">
              {principles.map(([term, description], index) => (
                <div
                  key={term}
                  className="min-h-52 border-r border-b border-navy-950/12 p-7"
                >
                  <span className="text-caption font-bold text-gray-text">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <dt className="mt-7 text-h4 font-semibold">{term}</dt>
                  <dd className="mt-4 text-body-sm text-gray-text">
                    {description}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </Section>

        <Section background="dark">
          <Container className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div className="relative flex min-h-80 items-end overflow-hidden rounded-[1rem] border border-offwhite/15 bg-navy-800 p-8 shadow-[var(--shadow-feature)]">
              <BrandMark decorative surface="dark" className="absolute -top-12 -right-14 h-72 w-72 opacity-20" />
              <div className="relative">
                <p className="text-caption font-bold tracking-[0.14em] text-accent-on-dark uppercase">Engenharia Atrium</p>
                <p className="mt-5 text-h4 font-semibold">
                  Vinicius Euleoterio
                </p>
                <p className="mt-1 text-body-sm text-offwhite/65">
                  Founder & Software Engineer
                </p>
              </div>
            </div>
            <div>
              <SectionHeader
                eyebrow="Experiência por trás"
                title="A empresa nasce de tecnologia que precisa funcionar de verdade."
                className="[&_h2]:text-offwhite"
              />
              <div className="mt-6 space-y-5 text-body-lg text-offwhite/70">
                <p>
                  Mais de 8 anos de experiência em engenharia de software,
                  backend, integrações e sistemas para ambientes de alta
                  criticidade, incluindo o setor financeiro.
                </p>
                <p>
                  Essa experiência orienta a Atrium a tratar manutenção,
                  segurança, integração e responsabilidade como parte da entrega
                  — sem transformar a empresa em um currículo pessoal.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        <Section>
          <Container className="max-w-4xl">
            <SectionHeader
              eyebrow="Visão"
              title="Evoluir somente quando existir motivo."
            />
            <p className="mt-6 text-body-lg text-gray-text">
              A direção futura inclui capacidades mais reutilizáveis, mais
              automação e um modelo operacional preparado para usar IA quando
              ela fizer sentido. Isso é uma direção, não uma promessa de
              funcionalidades que ainda não existem.
            </p>
          </Container>
        </Section>

        <DiagnosticCta href="/diagnostico" />
      </main>
      <Footer />
    </div>
  );
}
