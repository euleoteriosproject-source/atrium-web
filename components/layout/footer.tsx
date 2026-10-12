import Link from "next/link";

import { BrandLogo } from "@/components/brand";

import { TextLink } from "../ui/text-link";
import { Container } from "./container";

const solutionNavigation = [
  { label: "Sites & Experiências", href: "/solucoes/sites-e-portais" },
  { label: "Sistemas sob Medida", href: "/solucoes/sistemas-sob-medida" },
  {
    label: "Automações & Integrações",
    href: "/solucoes/automacoes-e-integracoes",
  },
  { label: "IA Aplicada", href: "/solucoes/ia-aplicada" },
] as const;

const companyNavigation = [
  { label: "Como trabalhamos", href: "/#como-trabalhamos" },
  { label: "Case", href: "/cases/cred-marvi" },
  { label: "Sobre", href: "/sobre" },
] as const;

const legalNavigation = [
  { label: "Privacidade", href: "/privacidade" },
  { label: "Termos", href: "/termos" },
] as const;

export function Footer() {
  return (
    <footer className="bg-navy-950 py-10 text-offwhite sm:py-12">
      <Container>
        <div className="grid gap-10 border-b border-offwhite/12 pb-10 sm:grid-cols-2 md:grid-cols-[1.2fr_1fr_0.8fr] md:gap-12 lg:gap-20">
          <div className="max-w-sm sm:col-span-2 md:col-span-1">
            <Link
              href="/"
              aria-label="Atrium — página inicial"
              className="inline-flex min-h-11 items-center"
            >
              <BrandLogo decorative surface="dark" className="h-9 w-auto" />
            </Link>
            <p className="mt-4 text-body-sm text-offwhite/70">
              Tecnologia que transforma operação em resultado.
            </p>
          </div>

          <nav aria-label="Soluções no rodapé">
            <p className="text-caption font-bold tracking-wide text-accent-on-dark uppercase">
              Soluções
            </p>
            <ul className="mt-5 space-y-3">
              {solutionNavigation.map((item) => (
                <li key={item.href}>
                  <TextLink
                    href={item.href}
                    variant="navigation"
                    className="text-offwhite/75 hover:text-accent-on-dark"
                  >
                    {item.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Empresa no rodapé">
            <p className="text-caption font-bold tracking-wide text-accent-on-dark uppercase">
              Empresa
            </p>
            <ul className="mt-5 space-y-3">
              {companyNavigation.map((item) => (
                <li key={item.href}>
                  <TextLink
                    href={item.href}
                    variant="navigation"
                    className="text-offwhite/75 hover:text-accent-on-dark"
                  >
                    {item.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-5 pt-6 text-caption text-offwhite/60 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
          <p>© 2026 Atrium.</p>
          <ul className="flex gap-5">
            {legalNavigation.map((item) => (
              <li key={item.href}>
                <TextLink
                  href={item.href}
                  variant="navigation"
                  className="text-caption text-offwhite/60 hover:text-accent-on-dark"
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
