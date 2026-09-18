import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { LinkButton } from "@/components/ui/link-button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <main
        id="conteudo"
        className="flex min-h-[65vh] items-center bg-navy-950 text-offwhite"
      >
        <Container className="py-20 sm:py-28">
          <div className="max-w-3xl">
            <p className="text-eyebrow font-bold tracking-[0.14em] text-gold-300 uppercase">
              Erro 404
            </p>
            <h1 className="mt-5 text-h1 font-semibold">
              Esta página não faz parte do caminho.
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg text-offwhite/70">
              O endereço pode ter mudado ou não existir. Você pode voltar ao
              início ou seguir direto para o diagnóstico.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/" variant="accent" size="lg">
                Voltar ao início
              </LinkButton>
              <LinkButton href="/diagnostico" variant="outlineDark" size="lg">
                Fazer diagnóstico
              </LinkButton>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
