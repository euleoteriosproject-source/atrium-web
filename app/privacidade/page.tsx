import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Eyebrow } from "@/components/ui/eyebrow";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Entenda quais informações a Atrium coleta no diagnóstico, por que são usadas e como solicitar atendimento sobre seus dados.",
  alternates: { canonical: "/privacidade" },
};

const sections = [
  {
    id: "dados",
    title: "Dados que podemos coletar",
    body: (
      <>
        Nome, empresa, WhatsApp, e-mail quando informado, prazo, faixa de
        investimento opcional, respostas e resultado do diagnóstico. Também
        podemos registrar origem, parâmetros UTM, página inicial e referrer
        quando disponíveis. Não solicitamos deliberadamente senhas, documentos
        pessoais, dados bancários ou outros documentos sensíveis no diagnóstico.
      </>
    ),
  },
  {
    id: "momento",
    title: "Quando o envio acontece",
    body: (
      <>
        As respostas permanecem no navegador durante a experiência. Elas são
        enviadas à Atrium somente quando você preenche os dados de contato,
        marca o consentimento e confirma o envio. O consentimento fica
        registrado junto à solicitação.
      </>
    ),
  },
  {
    id: "finalidade",
    title: "Para que usamos as informações",
    body: (
      <>
        Usamos os dados para responder à solicitação, compreender o contexto,
        priorizar oportunidades e conduzir a conversa comercial. A Atrium pode
        entrar em contato pelos canais informados. Não vendemos esses dados nem
        os usamos para uma lista de newsletter sem um consentimento específico.
      </>
    ),
  },
  {
    id: "servicos",
    title: "Serviços utilizados",
    body: (
      <>
        O Supabase armazena os leads e suporta as funções de backend. O
        Cloudflare Turnstile verifica abuso antes do registro; seu token não é
        persistido no lead. O Resend entrega ao administrador a notificação do
        novo lead. Links para WhatsApp podem ser usados para iniciar o contato.
        Esses serviços tratam somente os dados necessários às respectivas
        finalidades.
      </>
    ),
  },
  {
    id: "admin",
    title: "Atendimento e Admin interno",
    body: (
      <>
        Pessoas autorizadas da Atrium podem consultar o lead em uma ferramenta
        interna, registrar contato, status, observações e follow-up. O acesso é
        autenticado e autorizado; os dados não ficam disponíveis publicamente
        nem para usuários comuns do Supabase.
      </>
    ),
  },
  {
    id: "retencao",
    title: "Retenção e minimização",
    body: (
      <>
        Mantemos as informações enquanto forem necessárias para atender e
        acompanhar a solicitação, preservar o histórico comercial pertinente e
        cumprir obrigações aplicáveis. O prazo definitivo deve considerar a
        operação e as exigências legais da Atrium. Coletamos apenas o que é
        necessário para essas finalidades e aplicamos controles técnicos e de
        acesso proporcionais ao MVP.
      </>
    ),
  },
  {
    id: "direitos",
    title: "Seus direitos e canal de contato",
    body: (
      <>
        Você pode solicitar confirmação de tratamento, acesso, correção ou
        exclusão quando aplicável, além de esclarecer dúvidas sobre o uso dos
        dados. Use a página de{" "}
        <Link
          href="/contato"
          className="font-semibold text-navy-950 underline decoration-link-decoration decoration-2 underline-offset-4"
        >
          contato
        </Link>{" "}
        ou um canal oficial informado pela Atrium. A identificação legal e o
        canal definitivo do controlador devem ser revisados antes da publicação.
      </>
    ),
  },
] as const;

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
              Esta política descreve o tratamento realizado pelo site, pelo
              diagnóstico e pelo fluxo interno de atendimento do Atrium Web MVP.
            </p>
            <p className="mt-4 text-body-sm text-gray-text">
              Última atualização: 18 de setembro de 2026.
            </p>

            <div className="mt-12 space-y-10 text-body text-gray-text">
              {sections.map((section) => (
                <section
                  key={section.id}
                  aria-labelledby={`privacy-${section.id}`}
                >
                  <h2
                    id={`privacy-${section.id}`}
                    className="text-h3 font-semibold text-navy-950"
                  >
                    {section.title}
                  </h2>
                  <p className="mt-4">{section.body}</p>
                </section>
              ))}
            </div>
          </article>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
