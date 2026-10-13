import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AUTO_CENTER_DEMONSTRATION,
  DemoInterestForm,
} from "@/components/demonstrations/demo-interest-form";
import {
  buildDemonstrationWhatsAppMessage,
  buildDemonstrationWhatsAppUrl,
} from "@/domain/demonstrations/whatsapp";

const validInput = {
  name: "Cliente Teste",
  companyName: "Empresa Teste",
  demonstrationName: AUTO_CENTER_DEMONSTRATION,
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("demonstration WhatsApp handoff", () => {
  it("builds the approved minimal message and configured URL", () => {
    const message = buildDemonstrationWhatsAppMessage(validInput);
    const url = buildDemonstrationWhatsAppUrl(
      "+55 (11) 99999-9999",
      validInput,
    );

    expect(message).toContain("Nome: Cliente Teste");
    expect(message).toContain("Empresa: Empresa Teste");
    expect(message).toContain("Demonstração: Auto Center — Atrium Conversão");
    expect(message).not.toMatch(/token|utm|submission|diagnostic/i);
    expect(url).toMatch(/^https:\/\/wa\.me\/5511999999999\?text=/);
  });

  it("requires non-blank name and company", () => {
    render(<DemoInterestForm whatsappNumber="+55 11 99999-9999" />);

    fireEvent.change(screen.getByRole("textbox", { name: /Seu nome/i }), {
      target: { value: "   " },
    });
    fireEvent.change(
      screen.getByRole("textbox", { name: /Empresa ou negócio/i }),
      { target: { value: " " } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Continuar no WhatsApp/i }),
    );

    expect(
      screen.getByText(/Informe seu nome com 2 a 80/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Informe a empresa com 2 a 120/i),
    ).toBeInTheDocument();
  });

  it("opens WhatsApp in a new tab without calling a backend", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(<DemoInterestForm whatsappNumber="+55 11 99999-9999" />);

    fireEvent.change(screen.getByRole("textbox", { name: /Seu nome/i }), {
      target: { value: "Cliente Teste" },
    });
    fireEvent.change(
      screen.getByRole("textbox", { name: /Empresa ou negócio/i }),
      { target: { value: "Empresa Teste" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Continuar no WhatsApp/i }),
    );

    expect(open).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining("https://wa.me/5511999999999?text="),
      "_blank",
      "noopener,noreferrer",
    );
    const handoffUrl = open.mock.calls[0]?.[0] as string;
    const decoded = decodeURIComponent(handoffUrl);
    expect(decoded).toContain("Nome: Cliente Teste");
    expect(decoded).toContain("Empresa: Empresa Teste");
    expect(decoded).toContain("Auto Center — Atrium Conversão");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Ao continuar, seu nome e o nome da empresa/i),
    ).toBeInTheDocument();
  });

  it("shows the contact fallback when WhatsApp is unavailable", () => {
    render(<DemoInterestForm whatsappNumber={null} />);

    expect(
      screen.getByText(/O WhatsApp não está disponível neste momento/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Ir para contato/i }),
    ).toHaveAttribute("href", "/contato");
    expect(
      screen.queryByRole("button", { name: /Continuar no WhatsApp/i }),
    ).not.toBeInTheDocument();
  });
});
