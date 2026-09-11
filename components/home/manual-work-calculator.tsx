"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import {
  calculateMonthlyHours,
  formatApproximateHours,
} from "@/lib/manual-work-calculator";
import { buildDiagnosticHref } from "@/domain/diagnostic/preselection";

export function ManualWorkCalculator() {
  const [people, setPeople] = useState(3);
  const [minutesPerDay, setMinutesPerDay] = useState(30);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const monthlyHours = calculateMonthlyHours({
    people,
    minutesPerDay,
    daysPerWeek,
  });
  const formattedHours = formatApproximateHours(monthlyHours);
  const diagnosticHref = buildDiagnosticHref({
    goal: "AUTOMATION",
    calculator: {
      people,
      minutesPerDay,
      daysPerWeek,
      estimatedMonthlyHours: monthlyHours,
    },
  });

  return (
    <div className="grid overflow-hidden rounded-card border border-navy-950/12 bg-white shadow-card lg:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-6 p-6 sm:grid-cols-3 sm:p-9 lg:grid-cols-1 lg:p-10">
        <Input
          id="calculator-people"
          label="Pessoas envolvidas"
          type="number"
          inputMode="numeric"
          min={0}
          max={999}
          value={people}
          onChange={(event) =>
            setPeople(event.currentTarget.valueAsNumber || 0)
          }
        />
        <Input
          id="calculator-minutes"
          label="Minutos por dia"
          type="number"
          inputMode="numeric"
          min={0}
          max={1440}
          value={minutesPerDay}
          onChange={(event) =>
            setMinutesPerDay(event.currentTarget.valueAsNumber || 0)
          }
        />
        <Input
          id="calculator-days"
          label="Dias por semana"
          type="number"
          inputMode="numeric"
          min={0}
          max={7}
          value={daysPerWeek}
          onChange={(event) =>
            setDaysPerWeek(event.currentTarget.valueAsNumber || 0)
          }
        />
      </div>

      <div
        className="flex flex-col justify-center border-t border-navy-950/10 bg-navy-950 p-7 text-offwhite sm:p-10 lg:border-t-0 lg:border-l"
        aria-live="polite"
      >
        <p className="text-body-sm font-semibold text-gold-300">
          Estimativa mensal
        </p>
        <p className="mt-3 font-serif text-h2">
          <span aria-hidden="true">≈ </span>
          {formattedHours} horas/mês
        </p>
        <p className="mt-5 max-w-xl text-body text-offwhite/75">
          Sua equipe dedica aproximadamente {formattedHours} horas por mês a
          essa atividade.
        </p>
        <p className="mt-5 max-w-xl text-body-sm text-offwhite/60">
          Isso não significa que todo esse tempo possa ser eliminado. Mas indica
          que vale investigar quanto desse processo realmente precisa continuar
          manual.
        </p>
        <LinkButton
          href={diagnosticHref}
          variant="accent"
          className="mt-8 self-start"
        >
          Analisar esse processo
          <span aria-hidden="true">→</span>
        </LinkButton>
      </div>
    </div>
  );
}
