import { MultiChoiceQuestion } from "./multi-choice-question";

import { goalOptions } from "@/domain/diagnostic/questions";
import type { Goal, QuestionDefinition } from "@/domain/diagnostic/types";
import { cn } from "@/lib/utils";

type Props = {
  question: QuestionDefinition;
  selected: Goal[];
  primaryGoal?: Goal;
  onSelectionChange: (goals: Goal[]) => void;
  onPrimaryChange: (goal: Goal) => void;
};

export function GoalQuestion({
  question,
  selected,
  primaryGoal,
  onSelectionChange,
  onPrimaryChange,
}: Props) {
  return (
    <div className="space-y-7">
      <MultiChoiceQuestion
        question={question}
        value={selected}
        onChange={(values) => onSelectionChange(values as Goal[])}
      />

      {selected.length > 1 ? (
        <fieldset className="rounded-card border border-navy-950/15 bg-gray-bg p-5 sm:p-6">
          <legend className="px-1 text-body font-semibold">
            Qual é a prioridade agora?
          </legend>
          <div className="mt-3 grid gap-2">
            {selected.map((goal) => {
              const choice = goalOptions.find(({ value }) => value === goal);
              const checked = primaryGoal === goal;
              return (
                <label
                  key={goal}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-control border px-4 py-2.5 text-body-sm font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus-ring",
                    checked
                      ? "border-navy-950 bg-white"
                      : "border-transparent hover:border-navy-950/20",
                  )}
                >
                  <input
                    type="radio"
                    name="primary-goal"
                    checked={checked}
                    onChange={() => onPrimaryChange(goal)}
                    className="size-6 accent-navy-950 focus-visible:outline-none"
                  />
                  {choice?.label ?? goal}
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}
