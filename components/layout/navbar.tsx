import Link from "next/link";

import { BrandLogo } from "@/components/brand";

import { LinkButton } from "../ui/link-button";
import { TextLink } from "../ui/text-link";
import { Container } from "./container";
import { MobileMenu } from "./mobile-menu";
import { primaryNavigation } from "./navigation";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-navy-950/8 bg-offwhite/92 shadow-[0_1px_0_rgb(7_24_50_/_0.03)] backdrop-blur-xl">
      <Container className="flex min-h-20 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="Atrium — página inicial"
          className="inline-flex min-h-11 items-center"
        >
          <BrandLogo decorative surface="light" className="h-8 w-auto" />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-8 lg:flex"
        >
          <ul className="flex items-center gap-8">
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
