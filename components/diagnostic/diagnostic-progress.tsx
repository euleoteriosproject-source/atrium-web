import { Progress } from "@/components/ui/progress";
import type { QuestionDefinition } from "@/domain/diagnostic/types";

function stageLabel(questionId: string) {
  if (questionId.startsWith("Q")) return "Contexto da empresa";
  return "Rotina e processo";
}

export function DiagnosticProgress({
  question,
  questions,
}: {
  question: QuestionDefinition;
  questions: readonly QuestionDefinition[];
}) {
  const currentIndex = Math.max(
    questions.findIndex(({ id }) => id === question.id),
    0,
  );
  return (
    <Progress
      value={currentIndex + 1}
      max={questions.length}
      label={stageLabel(question.id)}
      valueText="Em andamento"
    />
  );
}
