import type { QuestionDefinition } from "@/domain/diagnostic/types";
import { cn } from "@/lib/utils";

type Props = {
  question: QuestionDefinition;
  value: string[];
  onChange: (value: string[]) => void;
};

export function MultiChoiceQuestion({ question, value, onChange }: Props) {
  function toggle(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  }

  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="sr-only">{question.title}</legend>
      {question.options?.map((choice) => {
        const checked = value.includes(choice.value);
        return (
          <label
            key={choice.value}
            className={cn(
              "motion-interactive flex min-h-15 cursor-pointer items-center gap-4 rounded-card border bg-white px-4 py-3.5 text-body transition-[border-color,background-color,box-shadow] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-500 sm:px-5",
              checked
                ? "border-navy-950 bg-navy-950/[0.035] shadow-[inset_3px_0_0_#d4af37]"
                : "border-navy-950/15 hover:border-navy-950/45",
            )}
          >
            <input
              type="checkbox"
              value={choice.value}
              checked={checked}
              onChange={() => toggle(choice.value)}
              className="size-6 shrink-0 accent-navy-950 focus-visible:outline-none"
            />
            <span className="font-semibold">{choice.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
