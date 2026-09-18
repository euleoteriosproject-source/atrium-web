import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";

type DiagnosticCtaProps = Readonly<{
  href: string;
  title?: string;
  description?: string;
  label?: string;
}>;

export function DiagnosticCta({
  href,
  title = "O que na sua operação ainda deveria ser mais simples?",
  description = "Conte como funciona hoje. Talvez exista uma maneira melhor.",
  label = "Diagnóstico gratuito",
}: DiagnosticCtaProps) {
  return (
    <Section background="dark" spacing="compact">
      <Container className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
        <div className="max-w-3xl">
          <Eyebrow tone="dark">Próximo passo</Eyebrow>
          <h2 className="mt-4 text-h2 font-semibold">{title}</h2>
          <p className="mt-5 text-body-lg text-offwhite/70">{description}</p>
        </div>
        <LinkButton
          href={href}
          variant="accent"
          size="lg"
          className="justify-self-start"
        >
          {label}
          <span aria-hidden="true">→</span>
        </LinkButton>
      </Container>
    </Section>
  );
}
