import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ManualWorkCalculator } from "@/components/home/manual-work-calculator";
import { calculateMonthlyHours } from "@/lib/manual-work-calculator";

describe("manual-work calculator", () => {
  it("uses the SDD monthly-hours formula", () => {
    expect(
      calculateMonthlyHours({
        people: 3,
        minutesPerDay: 30,
        daysPerWeek: 5,
      }),
    ).toBeCloseTo(32.475);
  });

  it("updates the local estimate when an input changes", () => {
    render(<ManualWorkCalculator />);

    expect(screen.getByText("32 horas/mês")).toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("spinbutton", { name: "Pessoas envolvidas" }),
      {
        target: { value: "6" },
      },
    );

    expect(screen.getByText("65 horas/mês")).toBeInTheDocument();
  });

  it("does not produce negative effort", () => {
    expect(
      calculateMonthlyHours({
        people: -2,
        minutesPerDay: 30,
        daysPerWeek: 5,
      }),
    ).toBe(0);
  });
});
