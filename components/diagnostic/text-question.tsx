import { Textarea } from "@/components/ui/textarea";
import type { QuestionDefinition } from "@/domain/diagnostic/types";

type Props = {
  question: QuestionDefinition;
  value?: string;
  onChange: (value: string) => void;
};

export function TextQuestion({ question, value = "", onChange }: Props) {
  return (
    <Textarea
      id={`answer-${question.id}`}
      label="Sua resposta"
      value={value}
      maxLength={question.maxLength}
      onChange={(event) => onChange(event.currentTarget.value)}
      rows={6}
    />
  );
}
