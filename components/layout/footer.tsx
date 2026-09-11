import Link from "next/link";

import { TextLink } from "../ui/text-link";
import { Container } from "./container";
import { primaryNavigation } from "./navigation";

const legalNavigation = [
  { label: "Privacidade", href: "/privacidade" },
  { label: "Termos", href: "/termos" },
] as const;

export function Footer() {
  return (
    <footer className="bg-navy-950 py-12 text-offwhite sm:py-16">
      <Container>
        <div className="grid gap-10 border-b border-offwhite/15 pb-10 md:grid-cols-[1fr_auto] md:items-start">
          <div className="max-w-md">
            <Link
              href="/"
              aria-label="Atrium — página inicial"
              className="inline-flex min-h-11 items-center gap-2 text-h4 font-semibold tracking-tight"
            >
              <span aria-hidden="true" className="size-2 bg-gold-500" />
              Atrium
            </Link>
            <p className="mt-4 text-body-sm text-offwhite/70">
              Tecnologia que transforma operação em resultado.
            </p>
          </div>

          <nav aria-label="Navegação do rodapé">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 md:text-right">
              {primaryNavigation.map((item) => (
                <li key={item.href}>
                  <TextLink
                    href={item.href}
                    variant="navigation"
                    className="text-offwhite/75 hover:text-gold-300"
                  >
                    {item.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-5 pt-8 text-caption text-offwhite/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Atrium.</p>
          <ul className="flex gap-5">
            {legalNavigation.map((item) => (
              <li key={item.href}>
                <TextLink
                  href={item.href}
                  variant="navigation"
                  className="text-caption text-offwhite/60 hover:text-gold-300"
                >
                  {item.label}
                </TextLink>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
