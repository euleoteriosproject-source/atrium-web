import Link from "next/link";

import { BrandLogo } from "@/components/brand";

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
          className="inline-flex min-h-11 items-center"
        >
          <BrandLogo decorative surface="light" className="h-8 w-auto" />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-7 lg:flex"
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
