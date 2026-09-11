import Link from "next/link";

import { LinkButton } from "../ui/link-button";
import { TextLink } from "../ui/text-link";
import { Container } from "./container";
import { MobileMenu } from "./mobile-menu";
import { primaryNavigation } from "./navigation";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-navy-950/10 bg-offwhite/95 backdrop-blur-md">
      <Container className="flex min-h-18 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="Atrium — página inicial"
          className="inline-flex min-h-11 items-center gap-2 text-h4 font-semibold tracking-tight"
        >
          <span aria-hidden="true" className="size-2 bg-gold-500" />
          Atrium
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-7 md:flex"
        >
          <ul className="flex items-center gap-7">
            {primaryNavigation.map((item) => (
              <li key={item.href}>
                <TextLink href={item.href} variant="navigation">
                  {item.label}
                </TextLink>
              </li>
            ))}
          </ul>
          <LinkButton href="/diagnostico" size="sm">
            Diagnóstico gratuito
          </LinkButton>
        </nav>

        <MobileMenu />
      </Container>
    </header>
  );
}
