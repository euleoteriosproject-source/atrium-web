import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ResultShell } from "@/components/results/result-shell";
import { createDiagnosticState } from "@/domain/diagnostic/types";
import {
  DIAGNOSTIC_SESSION_KEY,
  loadDiagnosticSession,
  saveDiagnosticSession,
} from "@/lib/session";

const completedState = {
  ...createDiagnosticState(new Date("2026-01-01T00:00:00.000Z")),
  primaryGoal: "AUTOMATION" as const,
  segment: "SERVICES",
  companySize: "TWO_TO_FIVE",
  answers: {
    Q001: ["AUTOMATION"],
    Q002: "SERVICES",
    Q003: "TWO_TO_FIVE",
    Q005: ["WHATSAPP", "SPREADSHEET"],
    A001: "COPY_REGISTER",
    A002: "DAILY",
    A003: "TWO_TO_THREE",
    A004: "THIRTY_TO_SIXTY",
    A005: "FREQUENTLY",
    A006: "PARTLY",
    A007: "SOMETIMES",
  },
  stage: "complete" as const,
};

describe("diagnostic result UI", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => cleanup());

  it("shows an honest empty state without a completed session", async () => {
    render(<ResultShell />);
    const heading = await screen.findByRole("heading", {
      name: /conclua o diagnóstico para ver suas oportunidades/i,
    });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(
      screen.queryByRole("heading", { name: /oportunidades para explorar/i }),
    ).not.toBeInTheDocument();
  });

  it("restores a completed result after refresh from session storage", async () => {
    saveDiagnosticSession(completedState);
    const first = render(<ResultShell />);
    const heading = await screen.findByRole("heading", {
      name: /onde a tecnologia merece ser investigada primeiro/i,
    });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(
      screen.getByRole("heading", {
        name: /automatizar a transferência de informações/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Serviços")).toBeInTheDocument();
    expect(screen.queryByText(/score|pontuação|%/i)).not.toBeInTheDocument();

    first.unmount();
    render(<ResultShell />);
    expect(
      await screen.findByRole("heading", {
        name: /automatizar a transferência de informações/i,
      }),
    ).toBeInTheDocument();
  });

  it("prepares the stored journey for review", async () => {
    saveDiagnosticSession(completedState);
    render(<ResultShell />);
    const review = await screen.findByRole("link", {
      name: /revisar respostas/i,
    });
    review.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    });
    fireEvent.click(review);
    await waitFor(() =>
      expect(loadDiagnosticSession()).toMatchObject({
        stage: "questions",
        currentQuestionId: "Q001",
      }),
    );
  });

  it("clears the stored journey when starting again", async () => {
    saveDiagnosticSession(completedState);
    render(<ResultShell />);
    const restart = await screen.findByRole("link", {
      name: /recomeçar diagnóstico/i,
    });
    restart.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    });
    fireEvent.click(restart);
    expect(sessionStorage.getItem(DIAGNOSTIC_SESSION_KEY)).toBeNull();
  });
});
