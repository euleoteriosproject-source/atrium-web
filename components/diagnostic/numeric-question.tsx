import { Input } from "@/components/ui/input";
import type { QuestionDefinition } from "@/domain/diagnostic/types";

type Props = {
  question: QuestionDefinition;
  value?: number;
  onChange: (value: number) => void;
};

export function NumericQuestion({ question, value, onChange }: Props) {
  return (
    <Input
      id={`answer-${question.id}`}
      label="Valor"
      type="number"
      inputMode="numeric"
      value={value ?? ""}
      onChange={(event) => {
        if (Number.isFinite(event.currentTarget.valueAsNumber)) {
          onChange(event.currentTarget.valueAsNumber);
        }
      }}
    />
  );
}
