import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import Home from "@/app/page";

afterEach(() => cleanup());

describe("M2 homepage", () => {
  it("renders the canonical journey and primary call to action", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Sua empresa pode trabalhar melhor.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Quanto trabalho da sua empresa ainda depende de alguém fazer tudo manualmente?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /Descobrir oportunidades/ }),
    ).toHaveLength(2);
  });

  it("renders all accessible FAQ disclosures", () => {
    const { container } = render(<Home />);
    const page = within(container);

    expect(container.querySelectorAll("details")).toHaveLength(7);
    expect(
      page.getByText("Quanto custa desenvolver uma solução?"),
    ).toBeInTheDocument();
    expect(page.getByText("Posso começar pequeno?")).toBeInTheDocument();
  });

  it("uses semantic button variants for every filled CTA surface", () => {
    const { container } = render(<Home />);
    const page = within(container);

    const opportunityLinks = page.getAllByRole("link", {
      name: /Descobrir oportunidades/,
    });

    expect(opportunityLinks[0]).toHaveClass(
      "bg-accent-on-dark",
      "text-brand-navy",
    );
    expect(opportunityLinks[1]).toHaveClass("bg-navy-950", "text-offwhite");

    for (const label of [
      "Fazer diagnóstico",
      "Quero descobrir oportunidades",
      "Analisar esse processo",
    ]) {
      expect(page.getByRole("link", { name: new RegExp(label) })).toHaveClass(
        "bg-accent-on-dark",
        "text-brand-navy",
      );
    }

    expect(
      page.getByRole("link", { name: "Tenho um projeto em mente" }),
    ).toHaveClass("bg-transparent", "text-offwhite");
    expect(
      page.getByRole("link", { name: "Conversar pelo WhatsApp" }),
    ).toHaveClass("bg-transparent", "text-navy-950");
    expect(
      page.getByRole("link", { name: "Diagnóstico gratuito" }),
    ).toHaveClass("bg-navy-950", "text-offwhite");
  });

  it("keeps the internal case and adds the published Cred Marvi proof", () => {
    render(<Home />);

    expect(
      screen.getByRole("link", { name: /Conhecer o caso/i }),
    ).toHaveAttribute("href", "/cases/cred-marvi");

    const externalProof = screen.getByRole("link", {
      name: /Ver projeto publicado/i,
    });
    expect(externalProof).toHaveAttribute(
      "href",
      "https://credmarvi.netlify.app/",
    );
    expect(externalProof).toHaveAttribute("target", "_blank");
    expect(externalProof).toHaveAttribute(
      "rel",
      expect.stringContaining("noopener"),
    );
  });
});
