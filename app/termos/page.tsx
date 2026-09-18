import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Eyebrow } from "@/components/ui/eyebrow";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos aplicáveis ao uso do site e do diagnóstico inicial da Atrium.",
  alternates: { canonical: "/termos" },
};

const terms = [
  [
    "Caráter informativo",
    "O conteúdo do site e o resultado do diagnóstico oferecem uma orientação inicial baseada nas informações fornecidas. Eles não substituem uma análise detalhada da operação.",
  ],
  [
    "Sem proposta ou contrato automático",
    "O diagnóstico, uma conversa ou uma estimativa inicial não constituem proposta comercial, contrato, garantia de viabilidade ou compromisso de execução. Qualquer contratação exige alinhamento e condições próprias.",
  ],
  [
    "Resultados e decisões",
    "As oportunidades apresentadas não prometem economia, receita, prazo ou resultado financeiro. Decisões de implementação dependem de descoberta, dados, riscos, integrações e contexto adicionais.",
  ],
  [
    "Disponibilidade",
    "Buscamos manter o site disponível e correto, mas podem ocorrer interrupções, falhas de serviços externos ou mudanças necessárias. Quando possível, o fluxo preserva alternativas como o contato por WhatsApp.",
  ],
  [
    "Uso aceitável",
    "Não use o site para enviar conteúdo ilícito, malicioso, automatizado de forma abusiva ou que viole direitos de terceiros. Não envie senhas, documentos pessoais ou informações sensíveis pelo diagnóstico.",
  ],
  [
    "Propriedade intelectual",
    "A marca, o conteúdo, a experiência, o código e os materiais do site pertencem à Atrium ou são usados sob licença. O acesso ao site não transfere direitos de reprodução ou exploração comercial.",
  ],
] as const;

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <main id="conteudo" className="text-navy-950">
        <Container className="py-14 sm:py-20 lg:py-24">
          <article className="max-w-3xl">
            <Eyebrow>Termos de uso</Eyebrow>
            <h1 className="mt-5 text-h1 font-semibold">
              Um diagnóstico inicial, não uma promessa automática.
            </h1>
            <p className="mt-6 text-body-lg text-gray-text">
              Estes termos orientam o uso do site institucional e do diagnóstico
              da Atrium. Ao utilizar a experiência, você concorda em fazê-lo de
              forma legítima e compatível com estas condições.
            </p>
            <p className="mt-4 text-body-sm text-gray-text">
              Última atualização: 18 de setembro de 2026.
            </p>

            <div className="mt-12 space-y-10 text-body text-gray-text">
              {terms.map(([title, body], index) => (
                <section key={title} aria-labelledby={`term-${index}`}>
                  <h2
                    id={`term-${index}`}
                    className="text-h3 font-semibold text-navy-950"
                  >
                    {title}
                  </h2>
                  <p className="mt-4">{body}</p>
                </section>
              ))}
              <section aria-labelledby="term-contact">
                <h2
                  id="term-contact"
                  className="text-h3 font-semibold text-navy-950"
                >
                  Contato e privacidade
                </h2>
                <p className="mt-4">
                  Para dúvidas sobre estes termos, use a página de{" "}
                  <Link
                    href="/contato"
                    className="font-semibold text-navy-950 underline decoration-gold-500 decoration-2 underline-offset-4"
                  >
                    contato
                  </Link>
                  . O tratamento de dados é explicado na{" "}
                  <Link
                    href="/privacidade"
                    className="font-semibold text-navy-950 underline decoration-gold-500 decoration-2 underline-offset-4"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </section>
            </div>
          </article>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
