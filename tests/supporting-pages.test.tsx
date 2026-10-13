import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import CredMarviCasePage from "@/app/cases/cred-marvi/page";
import DemonstrationsPage from "@/app/demonstracoes/page";
import { metadata as adminMetadata } from "@/app/admin/layout";
import { metadata as handoffMetadata } from "@/app/contato/whatsapp/page";
import { metadata as resultMetadata } from "@/app/diagnostico/resultado/page";
import NotFound from "@/app/not-found";
import PrivacyPage from "@/app/privacidade/page";
import AboutPage from "@/app/sobre/page";
import AutomationsAndIntegrationsPage from "@/app/solucoes/automacoes-e-integracoes/page";
import AppliedAiPage from "@/app/solucoes/ia-aplicada/page";
import SolutionsPage from "@/app/solucoes/page";
import CustomSystemsPage from "@/app/solucoes/sistemas-sob-medida/page";
import SitesAndExperiencesPage from "@/app/solucoes/sites-e-experiencias/page";
import SitesAndPortalsPage from "@/app/solucoes/sites-e-portais/page";
import TermsPage from "@/app/termos/page";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

afterEach(() => cleanup());

describe("M6C supporting pages", () => {
  it("presents all four solution pillars with working detail and diagnostic links", () => {
    render(<SolutionsPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Tecnologia certa para o problema certo/i,
      }),
    ).toBeInTheDocument();

    for (const [name, href] of [
      ["Sites & Experiências Digitais", "/solucoes/sites-e-portais"],
      ["Automações & Integrações", "/solucoes/automacoes-e-integracoes"],
      ["Sistemas sob Medida", "/solucoes/sistemas-sob-medida"],
      ["IA Aplicada", "/solucoes/ia-aplicada"],
    ] as const) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
      expect(
        screen
          .getByRole("heading", { name })
          .closest("article")
          ?.querySelector(`a[href="${href}"]`),
      ).toBeInTheDocument();
    }

    expect(
      document.querySelector('a[href="/diagnostico?goal=WEBSITE"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('a[href="/diagnostico?goal=AUTOMATION"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('a[href="/diagnostico?goal=SOFTWARE"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('a[href="/diagnostico?goal=AI"]'),
    ).toBeTruthy();
    for (const id of [
      "sites-e-experiencias",
      "automacoes-e-integracoes",
      "sistemas-sob-medida",
      "ia-aplicada",
    ]) {
      expect(document.getElementById(id)).toBeTruthy();
      expect(document.querySelector(`a[href="#${id}"]`)).toBeTruthy();
    }
    expect(
      screen.getByRole("link", { name: /Ver demonstração Auto Center/i }),
    ).toHaveAttribute("href", "/demonstracoes#auto-center");
    expect(
      screen
        .getAllByRole("article")
        .filter((article) =>
          article.textContent?.includes("Ver demonstração Auto Center"),
        ),
    ).toHaveLength(1);
  });

  it("presents the Auto Center demonstration as honest commercial proof", () => {
    render(<DemonstrationsPage />);

    expect(document.getElementById("auto-center")).toBeTruthy();
    expect(
      screen.getByRole("heading", {
        name: /Uma experiência digital que começa antes do WhatsApp/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/não representa uma oficina real/i),
    ).toBeInTheDocument();

    const externalLink = screen.getByRole("link", {
      name: /Explorar demonstração/i,
    });
    expect(externalLink).toHaveAttribute(
      "href",
      "https://atrium-auto-center.netlify.app/",
    );
    expect(externalLink).not.toHaveAttribute("target");
    expect(externalLink).not.toHaveAttribute("rel");
    expect(externalLink).toHaveTextContent("→");
    expect(externalLink).not.toHaveTextContent("↗");
    expect(
      screen.getByAltText(/demonstração Atrium para oficinas/i),
    ).toHaveAttribute(
      "src",
      expect.stringContaining("auto-center-preview.png"),
    );
  });

  it.each([
    [SitesAndPortalsPage, /Um site pode fazer mais/i, "WEBSITE"],
    [SitesAndExperiencesPage, /Um site pode fazer mais/i, "WEBSITE"],
    [
      AutomationsAndIntegrationsPage,
      /a mesma coisa todos os dias/i,
      "AUTOMATION",
    ],
    [CustomSystemsPage, /não cabe mais em uma planilha/i, "SOFTWARE"],
    [AppliedAiPage, /IA só é interessante/i, "AI"],
  ])(
    "renders a complete solution page with preselection",
    (Page, title, goal) => {
      render(<Page />);

      expect(
        screen.getByRole("heading", { level: 1, name: title }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Sinais que merecem investigação"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Clareza antes de complexidade."),
      ).toBeInTheDocument();
      expect(
        document.querySelector(`a[href="/diagnostico?goal=${goal}"]`),
      ).toBeTruthy();
    },
  );

  it("keeps the case factual and routes its CTA to automation discovery", () => {
    render(<CredMarviCasePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /De conversas desestruturadas para uma jornada organizada/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Sem promessas que o caso não pode provar/i),
    ).toBeInTheDocument();
    expect(
      document.querySelector('a[href="/diagnostico?goal=AUTOMATION"]'),
    ).toBeTruthy();
    const publicProject = screen.getByRole("link", {
      name: /Ver site da Cred Marvi/i,
    });
    expect(publicProject).toHaveAttribute(
      "href",
      "https://credmarvi.netlify.app/",
    );
    expect(publicProject).toHaveAttribute("target", "_blank");
    expect(publicProject).toHaveAttribute(
      "rel",
      expect.stringContaining("noopener"),
    );
    expect(publicProject).toHaveAttribute(
      "rel",
      expect.stringContaining("noreferrer"),
    );
    expect(publicProject).toHaveTextContent("↗");
    expect(
      screen.getByAltText(/Página inicial publicada da Cred Marvi/i),
    ).toHaveAttribute("src", expect.stringContaining("cred-marvi-preview.png"));
  });

  it("presents Atrium as a company and keeps the founder as supporting proof", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Engenharia séria para problemas/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/A Atrium existe para entender/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Vinicius Euleoterio")).toBeInTheDocument();
  });

  it("describes the real privacy processors and internal lead operation", () => {
    render(<PrivacyPage />);

    expect(
      screen.getByText(/O Supabase armazena os leads/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/O Resend entrega ao administrador/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Atendimento e Admin interno" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "contato" })).toHaveAttribute(
      "href",
      "/contato",
    );
  });

  it("keeps terms concise and links privacy and contact", () => {
    render(<TermsPage />);

    expect(
      screen.getByRole("heading", { name: /diagnóstico inicial/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Sem proposta ou contrato automático",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Política de Privacidade" }),
    ).toHaveAttribute("href", "/privacidade");
  });

  it("offers only the expected recovery actions on the 404 page", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Esta página não faz parte do caminho.",
    );
    expect(
      screen.getByRole("link", { name: "Voltar ao início" }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: "Fazer diagnóstico" }),
    ).toHaveAttribute("href", "/diagnostico");
  });

  it("uses existing public routes in header and footer without exposing Admin", () => {
    const { container } = render(
      <>
        <Navbar />
        <Footer />
      </>,
    );

    for (const href of [
      "/solucoes",
      "/cases/cred-marvi",
      "/sobre",
      "/privacidade",
      "/termos",
    ]) {
      expect(container.querySelector(`a[href="${href}"]`)).toBeTruthy();
    }
    expect(screen.getAllByRole("link", { name: "Demonstrações" })).toHaveLength(
      2,
    );
    for (const link of screen.getAllByRole("link", {
      name: "Demonstrações",
    })) {
      expect(link).toHaveAttribute("href", "/demonstracoes");
    }
    expect(container.querySelector('a[href^="/admin"]')).toBeNull();
  });

  it("keeps private and transient routes out of search indexes", () => {
    expect(adminMetadata.robots).toMatchObject({ index: false, follow: false });
    expect(resultMetadata.robots).toMatchObject({
      index: false,
      follow: false,
    });
    expect(handoffMetadata.robots).toMatchObject({
      index: false,
      follow: false,
    });
  });
});
