import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MobileMenu } from "@/components/layout/mobile-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

describe("Button", () => {
  it("announces and disables its loading state", () => {
    render(<Button loading>Enviar</Button>);

    const button = screen.getByRole("button", { name: "Carregando" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("provides a gold accent variant for conversion CTAs on dark surfaces", () => {
    render(<Button variant="accent">Descobrir oportunidades</Button>);

    expect(
      screen.getByRole("button", { name: "Descobrir oportunidades" }),
    ).toHaveClass("bg-gold-500", "text-navy-950", "border-gold-500");
  });

  it("provides an outline variant without competing light-surface colors", () => {
    render(<Button variant="outlineDark">Tenho um projeto em mente</Button>);

    const button = screen.getByRole("button", {
      name: "Tenho um projeto em mente",
    });

    expect(button).toHaveClass(
      "bg-transparent",
      "text-offwhite",
      "border-offwhite/35",
    );
    expect(button).not.toHaveClass("text-navy-950", "bg-offwhite");
  });
});

describe("Input", () => {
  it("associates label, guidance and error with the control", () => {
    render(
      <Input
        label="Empresa"
        description="Informe o nome comercial."
        error="Este campo é obrigatório."
      />,
    );

    const input = screen.getByRole("textbox", { name: "Empresa" });
    const descriptionIds = input.getAttribute("aria-describedby")?.split(" ");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(descriptionIds).toHaveLength(2);
    expect(screen.getByText("Este campo é obrigatório.")).toHaveAttribute(
      "id",
      descriptionIds?.[1],
    );
  });
});

describe("Progress", () => {
  it("clamps values exposed to assistive technology", () => {
    render(
      <Progress label="Etapas" value={12} max={10} valueText="Concluído" />,
    );

    expect(screen.getByRole("progressbar", { name: "Etapas" })).toHaveAttribute(
      "aria-valuenow",
      "10",
    );
  });
});

describe("MobileMenu", () => {
  it("opens with focus on navigation and closes with Escape", () => {
    render(<MobileMenu />);

    const trigger = screen.getByRole("button", { name: "Abrir menu" });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Soluções" })).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveFocus();
    expect(
      screen.queryByRole("navigation", { name: "Navegação móvel" }),
    ).not.toBeInTheDocument();
  });
});
