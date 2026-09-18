import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminLeadDetailView } from "@/components/admin/admin-lead-detail";
import { AdminLeadsDashboard } from "@/components/admin/admin-leads-dashboard";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminApiError } from "@/domain/admin/client";

const mocks = vi.hoisted(() => ({
  auth: {
    session: {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresAt: 4_000_000_000,
      user: { id: "admin-id", email: "admin@example.com" },
    } as
      | {
          accessToken: string;
          refreshToken: string;
          expiresAt: number;
          user: { id: string; email: string };
        }
      | undefined,
    checking: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    expire: vi.fn(),
  },
  replace: vi.fn(),
  router: undefined as unknown as { replace: ReturnType<typeof vi.fn> },
  getAdminLeads: vi.fn(),
  getAdminLead: vi.fn(),
  runAdminLeadAction: vi.fn(),
}));

mocks.router = { replace: mocks.replace };

vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
  useSearchParams: () => new URLSearchParams("publicCode=AT-26-ABC123"),
}));

vi.mock("@/components/admin/admin-auth-provider", () => ({
  useAdminAuth: () => mocks.auth,
  adminApiConfig: {
    supabaseUrl: "https://project.supabase.co",
    publishableKey: "publishable-key",
  },
}));

vi.mock("@/domain/admin/client", () => ({
  AdminApiError: class AdminApiError extends Error {
    constructor(readonly code: string) {
      super(
        code === "FORBIDDEN"
          ? "Você não tem autorização para acessar esta área."
          : code === "UNAUTHENTICATED"
            ? "Sua sessão expirou. Entre novamente."
            : "Não foi possível carregar os dados agora.",
      );
    }
  },
  getAdminLeads: mocks.getAdminLeads,
  getAdminLead: mocks.getAdminLead,
  runAdminLeadAction: mocks.runAdminLeadAction,
}));

const listResponse = {
  success: true,
  summary: {
    total: 1,
    byStatus: {
      NEW: 1,
      CONTACTED: 0,
      QUALIFIED: 0,
      PROPOSAL: 0,
      WON: 0,
      LOST: 0,
    },
  },
  items: [
    {
      publicCode: "AT-26-ABC123",
      createdAt: "2026-09-16T12:00:00.000Z",
      companyName: "Empresa Exemplo",
      contactName: "Ana Silva",
      phone: "+5511999999999",
      status: "NEW",
      leadTier: "A",
      leadScore: 91,
      timeframe: "NOW",
      primaryGoal: "AUTOMATION",
      whatsappHandoffAt: null,
      lastContactAt: null,
      nextFollowUpAt: null,
    },
  ],
  pagination: { page: 1, pageSize: 25, total: 1, totalPages: 1 },
};

describe("Admin Lite UI", () => {
  beforeEach(() => {
    mocks.auth.session = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresAt: 4_000_000_000,
      user: { id: "admin-id", email: "admin@example.com" },
    };
    mocks.auth.checking = false;
    mocks.auth.signIn.mockReset();
    mocks.auth.signOut.mockReset();
    mocks.auth.expire.mockReset();
    mocks.replace.mockReset();
    mocks.getAdminLeads.mockReset().mockResolvedValue(listResponse);
    mocks.getAdminLead.mockReset().mockResolvedValue({
      success: true,
      lead: {
        publicCode: "AT-26-ABC123",
        createdAt: "2026-09-16T12:00:00.000Z",
        status: "NEW",
        statusUpdatedAt: "2026-09-16T12:00:00.000Z",
        whatsappHandoffAt: "2026-09-16T12:01:00.000Z",
        lastContactAt: null,
        nextFollowUpAt: null,
        outreachWhatsAppUrl:
          "https://wa.me/5511999999999?text=Ol%C3%A1%2C%20Ana!",
        contact: {
          name: "Ana Silva",
          company: "Empresa Exemplo",
          phone: "+5511999999999",
          email: "ana@example.com",
        },
        profile: {
          businessSegment: "Serviços",
          companySize: "2–5 pessoas",
          primaryGoal: "Reduzir trabalho manual",
          additionalGoals: ["Usar inteligência artificial"],
          timeframe: "Agora / o quanto antes",
          budgetRange: "R$ 7.500–15.000",
        },
        qualification: { score: 91, tier: "A" },
        opportunities: [
          {
            title: "Reduzir trabalho manual com automação",
            priority: "Alta",
            summary: "Automatizar etapas repetitivas.",
          },
        ],
        diagnosticHighlights: [
          { label: "Ferramentas da rotina", values: ["Excel / Google Sheets"] },
        ],
        attribution: [{ label: "Origem", value: "google" }],
        consent: { contact: true, at: "2026-09-16T12:00:00.000Z" },
        activities: [
          {
            type: "NOTE_ADDED",
            createdAt: "2026-09-17T12:00:00.000Z",
            label: "ObservaÃ§Ã£o adicionada",
            detail: null,
            note: "Retornar pela manhÃ£.",
          },
          {
            type: "LEAD_CREATED",
            createdAt: "2026-09-16T12:00:00.000Z",
            label: "Lead criado",
            detail: null,
            note: null,
          },
        ],
      },
    });
    mocks.runAdminLeadAction.mockReset().mockResolvedValue({ success: true });
  });

  afterEach(cleanup);

  it("shows generic login errors and redirects after a valid login", async () => {
    mocks.auth.session = undefined;
    mocks.auth.signIn.mockRejectedValueOnce(new Error("private auth detail"));
    render(<AdminLogin />);
    fireEvent.change(screen.getByLabelText(/^E-mail/), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Senha/), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível entrar",
    );

    mocks.auth.signIn.mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/admin"));
  });

  it("renders summary, responsive list views and applies search filters", async () => {
    render(<AdminLeadsDashboard />);
    expect(await screen.findByRole("heading", { name: "Leads" })).toBeVisible();
    expect(screen.getAllByText("Empresa Exemplo").length).toBeGreaterThan(1);
    expect(screen.getAllByText(/Ana Silva/).length).toBeGreaterThan(1);
    expect(screen.getAllByText("Novo").length).toBeGreaterThan(1);
    const desktopRow = screen.getAllByRole("row")[1];
    expect(desktopRow).toBeDefined();
    const cells = within(desktopRow as HTMLElement).getAllByRole("cell");
    expect(cells[7]).toHaveTextContent("Agora / o quanto antes");
    expect(cells[8]).toHaveTextContent("—");
    expect(cells[9]).toHaveTextContent("—");

    fireEvent.change(screen.getByLabelText("Buscar"), {
      target: { value: "Empresa" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
    await waitFor(() => expect(mocks.getAdminLeads).toHaveBeenCalledTimes(2));
    expect(mocks.getAdminLeads.mock.calls[1]?.[0]).toMatchObject({
      query: "Empresa",
      page: 1,
    });
  });

  it("renders humanized detail, contact links and no raw technical enums", async () => {
    render(<AdminLeadDetailView />);
    expect(await screen.findByText("Reduzir trabalho manual")).toBeVisible();
    expect(screen.getByText("Excel / Google Sheets")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Abrir WhatsApp" }),
    ).toHaveAttribute(
      "href",
      "https://wa.me/5511999999999?text=Ol%C3%A1%2C%20Ana!",
    );
    expect(screen.getByRole("link", { name: "Enviar e-mail" })).toHaveAttribute(
      "href",
      "mailto:ana@example.com",
    );
    expect(screen.queryByText("AUTOMATION")).not.toBeInTheDocument();
    expect(screen.queryByText("answers_json")).not.toBeInTheDocument();
    expect(screen.getByText("Histórico")).toBeVisible();
    expect(screen.getByText("Retornar pela manhÃ£.")).toBeVisible();
  });

  it("sends only a typed status action and reloads the authoritative detail", async () => {
    render(<AdminLeadDetailView />);
    const status = await screen.findByLabelText("Status comercial");
    expect(
      within(status).getByRole("option", { name: "Contatado" }),
    ).toBeDisabled();
    fireEvent.change(status, { target: { value: "QUALIFIED" } });
    fireEvent.click(screen.getByRole("button", { name: "Atualizar status" }));
    await waitFor(() =>
      expect(mocks.runAdminLeadAction).toHaveBeenCalledWith(
        {
          action: "CHANGE_STATUS",
          publicCode: "AT-26-ABC123",
          status: "QUALIFIED",
        },
        "access-token",
        expect.any(Object),
      ),
    );
    await waitFor(() => expect(mocks.getAdminLead).toHaveBeenCalledTimes(2));
  });

  it("redirects an anonymous visitor to login", async () => {
    mocks.auth.session = undefined;
    render(<AdminLeadsDashboard />);
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/admin/login"),
    );
  });

  it("shows empty and unauthorized states without exposing private detail", async () => {
    mocks.getAdminLeads.mockResolvedValueOnce({
      ...listResponse,
      items: [],
      pagination: { page: 1, pageSize: 25, total: 0, totalPages: 0 },
    });
    const empty = render(<AdminLeadsDashboard />);
    expect(await screen.findByText("Nenhum lead encontrado")).toBeVisible();
    empty.unmount();

    mocks.getAdminLeads.mockRejectedValueOnce(new AdminApiError("FORBIDDEN"));
    render(<AdminLeadsDashboard />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "não tem autorização",
    );
    expect(screen.queryByText("Empresa Exemplo")).not.toBeInTheDocument();
  });

  it("expires invalid sessions and performs logout", async () => {
    mocks.getAdminLeads.mockRejectedValueOnce(
      new AdminApiError("UNAUTHENTICATED"),
    );
    const expired = render(<AdminLeadsDashboard />);
    await waitFor(() => expect(mocks.auth.expire).toHaveBeenCalled());
    expect(mocks.replace).toHaveBeenCalledWith("/admin/login");
    expired.unmount();

    mocks.getAdminLeads.mockResolvedValueOnce(listResponse);
    render(<AdminLeadsDashboard />);
    fireEvent.click(await screen.findByRole("button", { name: "Sair" }));
    await waitFor(() => expect(mocks.auth.signOut).toHaveBeenCalled());
    expect(mocks.replace).toHaveBeenCalledWith("/admin/login");
  });
});
