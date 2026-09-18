import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";

type InstitutionalHeroProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}>;

export function InstitutionalHero({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: InstitutionalHeroProps) {
  return (
    <Section
      background="dark"
      spacing="spacious"
      className="relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 h-px w-2/5 bg-gold-500/55"
      />
      <Container className="relative">
        <div className="max-w-4xl">
          <Eyebrow tone="dark">{eyebrow}</Eyebrow>
          <h1 className="mt-6 text-h1 font-semibold">{title}</h1>
          <p className="mt-7 max-w-3xl text-body-lg text-offwhite/75">
            {description}
          </p>
          {primaryHref && primaryLabel ? (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <LinkButton href={primaryHref} variant="accent" size="lg">
                {primaryLabel}
                <span aria-hidden="true">→</span>
              </LinkButton>
              {secondaryHref && secondaryLabel ? (
                <LinkButton
                  href={secondaryHref}
                  variant="outlineDark"
                  size="lg"
                >
                  {secondaryLabel}
                </LinkButton>
              ) : null}
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
