import type { Metadata } from "next";

import { DiagnosticCta } from "@/components/institutional/diagnostic-cta";
import { InstitutionalHero } from "@/components/institutional/institutional-hero";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Section } from "@/components/layout/section";
import { LinkButton } from "@/components/ui/link-button";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata: Metadata = {
  title: "Case Cred Marvi",
  description:
    "Como a Atrium estruturou uma jornada para organizar contexto, consentimento e handoff humano no atendimento da Cred Marvi.",
  alternates: { canonical: "/cases/cred-marvi" },
};

const before = [
  "Contato inicial concentrado no WhatsApp",
  "Perguntas repetidas para descobrir o contexto",
  "Informações recebidas sem um padrão comum",
  "Descoberta manual antes de encaminhar o atendimento",
] as const;

const approach = [
  [
    "01",
    "Jornada estruturada",
    "Uma sequência clara para coletar contexto sem transformar o atendimento em um formulário interminável.",
  ],
  [
    "02",
    "Perguntas condicionais",
    "Cada resposta ajuda a definir o que faz sentido perguntar em seguida.",
  ],
  [
    "03",
    "Consentimento",
    "O envio de informações acontece de forma explícita e com finalidade clara.",
  ],
  [
    "04",
    "Informação organizada",
    "O contexto chega reunido para apoiar a próxima etapa humana.",
  ],
] as const;

export default function CredMarviCasePage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <main id="conteudo">
        <InstitutionalHero
          eyebrow="Case Cred Marvi"
          title="De conversas desestruturadas para uma jornada organizada."
          description="Um exemplo de como estruturar a entrada de uma operação sem retirar do atendimento humano a responsabilidade pela conversa e pela decisão."
          primaryHref="/diagnostico?goal=AUTOMATION"
          primaryLabel="Diagnóstico gratuito"
          secondaryHref="/solucoes/automacoes-e-integracoes"
          secondaryLabel="Entender a abordagem"
        />

        <Section>
          <Container className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <SectionHeader
              eyebrow="Contexto"
              title="O atendimento começava antes de existir contexto organizado."
            />
            <div className="space-y-6 text-body-lg text-gray-text">
              <p>
                O contato chegava pelo WhatsApp, um canal importante para a
                relação, mas que concentrava também a descoberta inicial do
                cenário.
              </p>
              <p>
                Antes de avançar, era necessário repetir perguntas, reunir
                informações que chegavam de formas diferentes e entender
                manualmente qual seria o próximo passo adequado.
              </p>
              <p className="font-semibold text-navy-950">
                O problema não era o WhatsApp. Era pedir ao atendimento que
                organizasse do zero, em cada conversa, informações que poderiam
                chegar mais claras.
              </p>
            </div>
          </Container>
        </Section>

        <Section background="muted">
          <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeader
                eyebrow="Antes"
                title="Atrito repetido na entrada"
              />
              <ul className="mt-9 space-y-4">
                {before.map((item) => (
                  <li key={item} className="flex gap-4 text-body">
                    <span aria-hidden="true" className="text-navy-950/35">
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-navy-950/12 bg-offwhite p-7 sm:p-9">
              <p className="text-eyebrow font-bold tracking-[0.14em] text-navy-800 uppercase">
                Problema operacional
              </p>
              <h2 className="mt-5 text-h3 font-semibold">
                Informação sem estrutura aumenta o trabalho de quem precisa
                atender.
              </h2>
              <p className="mt-5 text-body text-gray-text">
                Sem um caminho comum, o processo depende da memória, da
                experiência e da disponibilidade de cada pessoa para reconstruir
                o contexto.
              </p>
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <SectionHeader
              eyebrow="Abordagem"
              title="Organizar a jornada antes do handoff."
              description="A proposta foi estruturar o contexto e preservar a conversa humana para o momento em que ela gera mais valor."
            />
            <ol className="mt-12 grid border-t border-l border-navy-950/12 md:grid-cols-2 xl:grid-cols-4">
              {approach.map(([index, title, description]) => (
                <li
                  key={index}
                  className="border-r border-b border-navy-950/12 p-7"
                >
                  <span className="text-caption font-bold text-gray-text">
                    {index}
                  </span>
                  <h3 className="mt-7 text-h4 font-semibold">{title}</h3>
                  <p className="mt-4 text-body-sm text-gray-text">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </Container>
        </Section>

        <Section background="dark">
          <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeader
                eyebrow="Depois"
                title="Um handoff humano com contexto."
                className="[&_h2]:text-offwhite"
              />
              <p className="mt-6 text-body-lg text-offwhite/70">
                A jornada passa a reunir respostas condicionais, consentimento e
                informações organizadas antes de encaminhar a conversa.
              </p>
            </div>
            <div>
              <p className="text-eyebrow font-bold tracking-[0.14em] text-accent-on-dark uppercase">
                O que este caso valida
              </p>
              <ul className="mt-7 space-y-5 text-body text-offwhite/75">
                <li>
                  Uma jornada digital pode preparar melhor uma conversa
                  comercial.
                </li>
                <li>
                  Automação pode retirar repetição sem retirar a relação humana.
                </li>
                <li>
                  Consentimento e organização precisam fazer parte do fluxo.
                </li>
                <li>
                  A menor solução útil pode começar na entrada da operação.
                </li>
              </ul>
            </div>
          </Container>
        </Section>

        <Section>
          <Container className="max-w-4xl">
            <SectionHeader
              eyebrow="Princípios"
              title="Sem promessas que o caso não pode provar."
            />
            <p className="mt-6 text-body-lg text-gray-text">
              Este caso demonstra uma abordagem de estruturação de jornada e
              operação. Não publicamos métricas financeiras, percentuais de
              redução ou resultados que não tenham sido formalmente documentados
              e aprovados.
            </p>
            <p className="mt-5 text-body text-gray-text">
              Próximos passos, quando fizerem sentido, devem partir do uso real
              e das necessidades observadas — não de uma expansão automática de
              escopo.
            </p>
            <LinkButton
              href="https://credmarvi.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              className="mt-8"
            >
              Ver site da Cred Marvi <span aria-hidden="true">↗</span>
            </LinkButton>
          </Container>
        </Section>

        <DiagnosticCta
          href="/diagnostico?goal=AUTOMATION"
          title="Sua operação também começa com perguntas repetidas?"
          description="Mapeie o processo e descubra o menor ponto que vale organizar primeiro."
          label="Diagnóstico gratuito"
        />
      </main>
      <Footer />
    </div>
  );
}
