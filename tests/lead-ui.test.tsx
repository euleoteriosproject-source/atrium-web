import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContactShell } from "@/components/lead/contact-shell";
import { WhatsAppHandoff } from "@/components/lead/whatsapp-handoff";
import {
  createDiagnosticState,
  type DiagnosticState,
} from "@/domain/diagnostic/types";
import { loadLeadHandoff, saveLeadHandoff } from "@/domain/lead/session";
import { saveDiagnosticSession } from "@/lib/session";

const mocks = vi.hoisted(() => ({
  createLead: vi.fn(),
  trackLeadHandoff: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/domain/lead/client", () => ({
  createLead: mocks.createLead,
  trackLeadHandoff: mocks.trackLeadHandoff,
}));

vi.mock("@/lib/env", () => ({
  publicEnv: {
    NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site-key",
    NEXT_PUBLIC_WHATSAPP_NUMBER: "+5511999999999",
  },
}));

vi.mock("@/components/lead/turnstile-widget", () => ({
  TurnstileWidget: ({
    onTokenChange,
  }: {
    onTokenChange: (token: string | null) => void;
  }) => (
    <button type="button" onClick={() => onTokenChange("valid-token")}>
      Validar proteção
    </button>
  ),
}));

function completedDiagnostic(): DiagnosticState {
  return {
    ...createDiagnosticState(new Date("2026-09-11T00:00:00.000Z")),
    primaryGoal: "AUTOMATION",
    segment: "SERVICES",
    companySize: "TWO_TO_FIVE",
    acquisitionChannels: ["WHATSAPP"],
    tools: ["WHATSAPP", "SPREADSHEET"],
    answers: {
      Q001: ["AUTOMATION"],
      Q002: "SERVICES",
      Q003: "TWO_TO_FIVE",
      Q004: ["WHATSAPP"],
      Q005: ["WHATSAPP", "SPREADSHEET"],
      A001: "COPY_REGISTER",
      A002: "DAILY",
      A003: "TWO_TO_THREE",
      A004: "THIRTY_TO_SIXTY",
      A005: "FREQUENTLY",
      A006: "PARTLY",
      A007: "FREQUENTLY",
    },
    calculator: { estimatedMonthlyHours: 40.6 },
    stage: "complete",
  };
}

async function completeRequiredFields() {
  fireEvent.change(screen.getByLabelText(/^Seu nome/), {
    target: { value: "Ana Silva" },
  });
  fireEvent.change(screen.getByLabelText(/^Empresa ou negócio/), {
    target: { value: "Empresa Exemplo" },
  });
  fireEvent.change(screen.getByLabelText(/^WhatsApp/), {
    target: { value: "(11) 99999-9999" },
  });
  fireEvent.click(screen.getByLabelText(/Concordo em enviar meu diagnóstico/i));
  fireEvent.click(screen.getByRole("button", { name: "Validar proteção" }));
}

describe("M5 lead UI", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mocks.createLead.mockReset();
    mocks.trackLeadHandoff.mockReset().mockResolvedValue(true);
    mocks.push.mockReset();
    vi.spyOn(window.crypto, "randomUUID").mockReturnValue(
      "123e4567-e89b-42d3-a456-426614174000",
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows an honest state when the diagnostic session is absent", async () => {
    render(<ContactShell />);
    expect(
      await screen.findByRole("heading", {
        name: /Primeiro, vamos entender sua operação/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Fazer diagnóstico" }),
    ).toHaveAttribute("href", "/diagnostico");
  });

  it("validates required fields before calling the Edge Function", async () => {
    saveDiagnosticSession(completedDiagnostic());
    render(<ContactShell />);
    const submit = await screen.findByRole("button", {
      name: /Continuar para o WhatsApp/i,
    });
    fireEvent.click(submit);
    expect(await screen.findAllByRole("alert")).toHaveLength(4);
    await waitFor(() =>
      expect(screen.getByLabelText(/^Seu nome/)).toHaveFocus(),
    );
    expect(mocks.createLead).not.toHaveBeenCalled();
    expect(
      screen.getByRole("link", { name: "Política de Privacidade" }),
    ).toHaveAttribute("href", "/privacidade");
  });

  it("exposes mobile-friendly attributes and explicit field limits", async () => {
    saveDiagnosticSession(completedDiagnostic());
    render(<ContactShell />);
    const name = await screen.findByLabelText(/^Seu nome/);
    const company = screen.getByLabelText(/^Empresa ou negócio/);
    const phone = screen.getByLabelText(/^WhatsApp/);
    const email = screen.getByLabelText(/^E-mail/);

    expect(name).toHaveAttribute("maxlength", "80");
    expect(company).toHaveAttribute("maxlength", "120");
    expect(email).toHaveAttribute("maxlength", "254");
    expect(phone).toHaveAttribute("type", "tel");
    expect(phone).toHaveAttribute("inputmode", "tel");
    expect(phone).toHaveAttribute("autocomplete", "tel");
    expect(phone).toHaveAttribute("maxlength", "19");
    expect(phone).toHaveAccessibleDescription(
      /O \+55 e a formatação são aplicados automaticamente/i,
    );
  });

  it("formats progressive typing and paste with or without +55", async () => {
    saveDiagnosticSession(completedDiagnostic());
    render(<ContactShell />);
    const phone = (await screen.findByLabelText(
      /^WhatsApp/,
    )) as HTMLInputElement;

    fireEvent.change(phone, { target: { value: "5", selectionStart: 1 } });
    expect(phone).toHaveValue("+55 (5");
    fireEvent.change(phone, {
      target: { value: "51982895068", selectionStart: 11 },
    });
    expect(phone).toHaveValue("+55 (51) 98289-5068");

    fireEvent.change(phone, {
      target: { value: "+55 51 98289-5068", selectionStart: 18 },
    });
    expect(phone).toHaveValue("+55 (51) 98289-5068");
  });

  it("keeps backspace and middle editing usable and prevents excess digits", async () => {
    saveDiagnosticSession(completedDiagnostic());
    render(<ContactShell />);
    const phone = (await screen.findByLabelText(
      /^WhatsApp/,
    )) as HTMLInputElement;

    fireEvent.change(phone, {
      target: { value: "51982895068", selectionStart: 11 },
    });
    fireEvent.change(phone, {
      target: { value: "+55 (51) 98289-506", selectionStart: 18 },
    });
    expect(phone).toHaveValue("+55 (51) 9828-9506");

    fireEvent.change(phone, {
      target: { value: "+55 (51) 9728-9506", selectionStart: 11 },
    });
    expect(phone).toHaveValue("+55 (51) 9728-9506");
    await waitFor(() =>
      expect(phone.selectionStart).toBeLessThan(phone.value.length),
    );

    const accepted = phone.value;
    fireEvent.change(phone, {
      target: { value: "+55 (51) 99728-95069", selectionStart: 20 },
    });
    expect(phone).toHaveValue(accepted);
  });

  it("keeps invalid field values visible with accessible messages", async () => {
    saveDiagnosticSession(completedDiagnostic());
    render(<ContactShell />);
    const name = await screen.findByLabelText(/^Seu nome/);
    const company = screen.getByLabelText(/^Empresa ou negócio/);
    const phone = screen.getByLabelText(/^WhatsApp/);
    const consent = screen.getByLabelText(
      /Concordo em enviar meu diagnóstico/i,
    );

    fireEvent.change(name, { target: { value: "A" } });
    fireEvent.change(company, { target: { value: "Empresa Exemplo" } });
    fireEvent.change(phone, { target: { value: "51982" } });
    fireEvent.click(consent);
    fireEvent.click(
      screen.getByRole("button", { name: /Continuar para o WhatsApp/i }),
    );

    expect(await screen.findByText(/pelo menos 2 caracteres/i)).toBeVisible();
    expect(screen.getByText("Informe um WhatsApp com DDD.")).toBeVisible();
    expect(name).toHaveValue("A");
    expect(phone).toHaveValue("+55 (51) 982");
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(phone).toHaveAttribute("aria-invalid", "true");
    expect(mocks.createLead).not.toHaveBeenCalled();
  });

  it("submits once, exposes loading state and stores only the minimal handoff", async () => {
    saveDiagnosticSession(completedDiagnostic());
    let resolveRequest: ((value: unknown) => void) | undefined;
    mocks.createLead.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    render(<ContactShell />);
    await screen.findByRole("heading", {
      name: /Vamos conversar sobre o que você quer melhorar/i,
    });
    await completeRequiredFields();

    const submit = screen.getByRole("button", {
      name: /Continuar para o WhatsApp/i,
    });
    fireEvent.click(submit);
    fireEvent.click(submit);

    await waitFor(() => expect(mocks.createLead).toHaveBeenCalledTimes(1));
    expect(
      screen.getByRole("button", { name: "Enviando diagnóstico" }),
    ).toBeDisabled();

    resolveRequest?.({ success: true, publicCode: "AT-26-ABC123" });
    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith("/contato/whatsapp"),
    );

    expect(loadLeadHandoff()).toMatchObject({
      publicCode: "AT-26-ABC123",
      persisted: true,
      companyName: "Empresa Exemplo",
    });
    const stored = sessionStorage.getItem("atrium:lead-handoff:1.0.0") ?? "";
    expect(stored).not.toContain("Ana Silva");
    expect(stored).not.toContain("99999");
  });

  it("continues to the handoff when Supabase fails", async () => {
    saveDiagnosticSession(completedDiagnostic());
    mocks.createLead.mockRejectedValue(new Error("network unavailable"));
    render(<ContactShell />);
    await screen.findByRole("heading", {
      name: /Vamos conversar sobre o que você quer melhorar/i,
    });
    await completeRequiredFields();
    fireEvent.click(
      screen.getByRole("button", { name: /Continuar para o WhatsApp/i }),
    );

    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith("/contato/whatsapp"),
    );
    expect(loadLeadHandoff()).toMatchObject({
      publicCode: null,
      persisted: false,
    });
  });

  it("renders persisted and fallback WhatsApp handoffs without redirecting", async () => {
    saveDiagnosticSession(completedDiagnostic());
    saveLeadHandoff({
      version: "1.0.0",
      submissionId: "123e4567-e89b-42d3-a456-426614174000",
      companyName: "Empresa Exemplo",
      timeframe: "NOW",
      publicCode: "AT-26-ABC123",
      persisted: true,
      createdAt: "2026-09-11T12:00:00.000Z",
    });
    const view = render(<WhatsAppHandoff />);
    expect(await screen.findByText("AT-26-ABC123")).toBeInTheDocument();
    const whatsapp = screen.getByRole("link", { name: "Abrir WhatsApp" });
    expect(whatsapp).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/wa\.me\/5511999999999\?text=/),
    );
    fireEvent.click(whatsapp);
    await waitFor(() =>
      expect(mocks.trackLeadHandoff).toHaveBeenCalledWith(
        {
          submissionId: "123e4567-e89b-42d3-a456-426614174000",
          publicCode: "AT-26-ABC123",
        },
        expect.objectContaining({
          supabaseUrl: "https://project.supabase.co",
        }),
      ),
    );
    expect(mocks.push).not.toHaveBeenCalled();

    view.unmount();
    saveLeadHandoff({
      version: "1.0.0",
      submissionId: "123e4567-e89b-42d3-a456-426614174000",
      companyName: "Empresa Exemplo",
      timeframe: null,
      publicCode: null,
      persisted: false,
      createdAt: "2026-09-11T12:00:00.000Z",
    });
    render(<WhatsAppHandoff />);
    expect(
      await screen.findByText(
        /Não conseguimos registrar seu diagnóstico agora/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/tentar registrar novamente/i)).toBeInTheDocument();
    expect(mocks.trackLeadHandoff).toHaveBeenCalledTimes(1);
  });

  it("keeps the WhatsApp link available when handoff tracking fails", async () => {
    saveDiagnosticSession(completedDiagnostic());
    saveLeadHandoff({
      version: "1.0.0",
      submissionId: "123e4567-e89b-42d3-a456-426614174000",
      companyName: "Empresa Exemplo",
      timeframe: "NOW",
      publicCode: "AT-26-ABC123",
      persisted: true,
      createdAt: "2026-09-11T12:00:00.000Z",
    });
    mocks.trackLeadHandoff.mockResolvedValue(false);
    render(<WhatsAppHandoff />);
    const whatsapp = await screen.findByRole("link", {
      name: "Abrir WhatsApp",
    });
    fireEvent.click(whatsapp);
    expect(whatsapp).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/wa\.me\//),
    );
    await waitFor(() => expect(mocks.trackLeadHandoff).toHaveBeenCalledOnce());
  });
});
