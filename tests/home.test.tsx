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
        name: "O trabalho invisível também custa tempo.",
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
    expect(externalProof).toHaveTextContent("↗");
    expect(
      screen.getByAltText(/Página inicial publicada da Cred Marvi/i),
    ).toHaveAttribute("src", expect.stringContaining("cred-marvi-preview.png"));
  });

  it("presents real work early and keeps Auto Center framed as a demonstration", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Prova real antes da promessa." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Demonstração Atrium")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Explorar demonstração/i }),
    ).toHaveAttribute("href", "/demonstracoes#auto-center");
    expect(
      screen.getByAltText(/demonstração Atrium para oficinas/i),
    ).toHaveAttribute(
      "src",
      expect.stringContaining("auto-center-preview.png"),
    );
  });

  it("renders fragmented channels converging into an organized flow", () => {
    render(<Home />);

    for (const concept of ["WhatsApp", "Planilha", "E-mail"]) {
      expect(screen.getByText(concept)).toBeInTheDocument();
    }
    expect(screen.getByText("Fluxo organizado")).toBeInTheDocument();
    expect(
      screen.getByText("Informação chega ao lugar certo."),
    ).toBeInTheDocument();
  });

  it("renders the operational signals and shared founder proof", () => {
    render(<Home />);

    for (const pain of [
      "Minha equipe vive atualizando planilhas.",
      "Tudo acaba no WhatsApp.",
      "Copiamos informações entre ferramentas.",
      "Respondemos sempre as mesmas perguntas.",
      "Leads demoram para receber retorno.",
    ]) {
      expect(screen.getByText(`“${pain}”`)).toBeInTheDocument();
    }

    const founderImage = screen.getByAltText(
      "Retrato de Vinicius Euleoterio, fundador da Atrium",
    );
    expect(decodeURIComponent(founderImage.getAttribute("src") ?? "")).toContain(
      "/people/vinicius-euleoterio.jpg",
    );
    expect(screen.getByText("Vinicius Euleoterio")).toBeInTheDocument();
    expect(screen.getByText("Founder & Software Engineer")).toBeInTheDocument();

    for (const signal of [
      "8+ anos",
      "Backend & arquitetura",
      "Sistemas críticos",
      "Tecnologia aplicada",
    ]) {
      expect(screen.getByText(signal)).toBeInTheDocument();
    }
  });

  it("keeps the four work steps in an ordered process", () => {
    const { container } = render(<Home />);
    const process = container.querySelector("#como-trabalhamos ol");

    expect(process).toBeInTheDocument();
    expect(process?.querySelectorAll(":scope > li")).toHaveLength(4);
    for (const title of [
      "Entendemos",
      "Desenhamos",
      "Construímos",
      "Evoluímos",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });
});
