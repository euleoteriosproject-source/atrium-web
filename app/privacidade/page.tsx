import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Eyebrow } from "@/components/ui/eyebrow";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Entenda quais informações a Atrium coleta no diagnóstico e como elas são utilizadas.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <main id="conteudo" className="text-navy-950">
        <Container className="py-14 sm:py-20 lg:py-24">
          <article className="max-w-3xl">
            <Eyebrow>Privacidade</Eyebrow>
            <h1 className="mt-5 text-h1 font-semibold">
              Informações usadas com propósito claro.
            </h1>
            <p className="mt-6 text-body-lg text-gray-text">
              O diagnóstico permanece no seu navegador durante a experiência.
              Ele só é enviado à Atrium quando você preenche o contato, concorda
              com o envio e confirma a ação.
            </p>

            <div className="mt-12 space-y-10 text-body text-gray-text">
              <section aria-labelledby="privacy-data">
                <h2
                  id="privacy-data"
                  className="text-h3 font-semibold text-navy-950"
                >
                  Dados coletados
                </h2>
                <p className="mt-4">
                  Coletamos nome, empresa ou negócio, WhatsApp, e-mail quando
                  informado, prazo, faixa de investimento opcional, respostas e
                  resultado do diagnóstico. Também podemos registrar a origem da
                  visita, UTMs, página inicial e referrer quando disponíveis.
                </p>
              </section>

              <section aria-labelledby="privacy-purpose">
                <h2
                  id="privacy-purpose"
                  className="text-h3 font-semibold text-navy-950"
                >
                  Finalidade
                </h2>
                <p className="mt-4">
                  Essas informações são usadas para responder à solicitação,
                  compreender o contexto e conduzir a conversa comercial. A
                  Atrium não vende esses dados e não solicita informações
                  sensíveis no formulário.
                </p>
              </section>

              <section aria-labelledby="privacy-services">
                <h2
                  id="privacy-services"
                  className="text-h3 font-semibold text-navy-950"
                >
                  Infraestrutura e proteção contra abuso
                </h2>
                <p className="mt-4">
                  Os leads enviados são armazenados no Supabase. O Cloudflare
                  Turnstile é utilizado para verificar abuso antes do registro.
                  O token dessa verificação não é armazenado no lead.
                </p>
              </section>

              <section aria-labelledby="privacy-retention">
                <h2
                  id="privacy-retention"
                  className="text-h3 font-semibold text-navy-950"
                >
                  Retenção e solicitações
                </h2>
                <p className="mt-4">
                  Os dados são mantidos somente enquanto forem necessários para
                  acompanhar a solicitação e cumprir obrigações aplicáveis. Para
                  pedir informações, correção ou exclusão, use os canais de
                  contato disponibilizados pela Atrium.
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
