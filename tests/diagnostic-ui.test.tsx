import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DiagnosticProvider } from "@/components/diagnostic/diagnostic-provider";
import { DiagnosticShell } from "@/components/diagnostic/diagnostic-shell";

function renderDiagnostic(search = "") {
  window.history.replaceState({}, "", `/diagnostico${search}`);
  return render(
    <DiagnosticProvider>
      <DiagnosticShell />
    </DiagnosticProvider>,
  );
}

describe("diagnostic UI", () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.replaceState({}, "", "/diagnostico");
  });

  afterEach(() => cleanup());

  it("starts at an honest intro and validates the first question", async () => {
    renderDiagnostic();
    expect(
      await screen.findByRole("button", { name: "Abrir menu" }),
    ).toHaveAttribute("aria-expanded", "false");
    const start = await screen.findByRole("button", {
      name: /começar diagnóstico/i,
    });
    fireEvent.click(start);
    expect(
      screen.getByRole("heading", {
        name: /o que você mais gostaria de melhorar hoje/i,
      }),
    ).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      /selecione pelo menos um objetivo/i,
    );
  });

  it("keeps preselection editable and routes to the selected branch", async () => {
    renderDiagnostic("?goal=AUTOMATION");
    fireEvent.click(
      await screen.findByRole("button", { name: /começar diagnóstico/i }),
    );
    expect(
      screen.getByRole("checkbox", {
        name: /reduzir trabalho manual/i,
      }),
    ).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    const universalAnswers = [
      /serviços/i,
      /^1$/i,
      /whatsapp/i,
      /excel \/ google sheets/i,
    ];
    for (const answer of universalAnswers) {
      const control =
        screen.queryByRole("radio", { name: answer }) ??
        screen.getByRole("checkbox", { name: answer });
      fireEvent.click(control);
      fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    }
    expect(
      screen.getByRole("heading", {
        name: /qual dessas situações mais consome tempo/i,
      }),
    ).toBeInTheDocument();
  });

  it("requires a principal goal when multiple goals are selected", async () => {
    renderDiagnostic();
    fireEvent.click(
      await screen.findByRole("button", { name: /começar diagnóstico/i }),
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: /atrair mais clientes/i }),
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: /reduzir trabalho manual/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      /escolha qual objetivo/i,
    );
    fireEvent.click(
      screen.getByRole("radio", { name: /reduzir trabalho manual/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    expect(
      screen.getByRole("heading", { name: /qual é o tipo do seu negócio/i }),
    ).toBeInTheDocument();
  });

  it("persists the current point in sessionStorage", async () => {
    renderDiagnostic("?goal=WEBSITE");
    fireEvent.click(
      await screen.findByRole("button", { name: /começar diagnóstico/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    await waitFor(() => {
      expect(sessionStorage.getItem("atrium:diagnostic:1.0.0")).toContain(
        '"currentQuestionId":"Q002"',
      );
    });
  });

  it("offers explicit reset during the questionnaire", async () => {
    renderDiagnostic("?goal=AI");
    fireEvent.click(
      await screen.findByRole("button", { name: /começar diagnóstico/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Reiniciar" }));
    expect(
      screen.getByRole("heading", { name: /vamos entender sua operação/i }),
    ).toBeInTheDocument();
  });

  it("preserves an answer when navigating back", async () => {
    renderDiagnostic("?goal=SALES");
    fireEvent.click(
      await screen.findByRole("button", { name: /começar diagnóstico/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    fireEvent.click(screen.getByRole("radio", { name: "Serviços" }));
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    fireEvent.click(screen.getByRole("button", { name: /voltar/i }));
    expect(screen.getByRole("radio", { name: "Serviços" })).toBeChecked();
  });

  it("restores the active question after a simulated refresh", async () => {
    const firstRender = renderDiagnostic("?goal=WEBSITE");
    fireEvent.click(
      await screen.findByRole("button", { name: /começar diagnóstico/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    await waitFor(() =>
      expect(sessionStorage.getItem("atrium:diagnostic:1.0.0")).toContain(
        '"currentQuestionId":"Q002"',
      ),
    );
    firstRender.unmount();

    renderDiagnostic("?goal=WEBSITE");
    expect(
      await screen.findByRole("heading", {
        name: /qual é o tipo do seu negócio/i,
      }),
    ).toBeInTheDocument();
  });

  it("completes the applicable automation journey without a result screen", async () => {
    renderDiagnostic("?goal=AUTOMATION");
    fireEvent.click(
      await screen.findByRole("button", { name: /começar diagnóstico/i }),
    );

    for (let step = 0; step < 12; step += 1) {
      const controls = [
        ...screen.queryAllByRole<HTMLInputElement>("radio"),
        ...screen.queryAllByRole<HTMLInputElement>("checkbox"),
      ];
      if (!controls.some((control) => control.checked) && controls[0]) {
        fireEvent.click(controls[0]);
      }

      const continueButton = screen.queryByRole("button", {
        name: /continuar/i,
      });
      if (continueButton) {
        fireEvent.click(continueButton);
        continue;
      }
      fireEvent.click(screen.getByRole("button", { name: /concluir/i }));
      break;
    }

    expect(
      screen.getByRole("heading", { name: /diagnóstico concluído/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/oportunidades principais/i),
    ).not.toBeInTheDocument();
  });
});
