import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

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

    expect(opportunityLinks[0]).toHaveClass("bg-gold-500", "text-navy-950");
    expect(opportunityLinks[1]).toHaveClass("bg-navy-950", "text-offwhite");

    for (const label of [
      "Fazer diagnóstico",
      "Quero descobrir oportunidades",
      "Analisar esse processo",
    ]) {
      expect(page.getByRole("link", { name: new RegExp(label) })).toHaveClass(
        "bg-gold-500",
        "text-navy-950",
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
});
