import { Input } from "@/components/ui/input";
import type {
  DiagnosticAnswer,
  Goal,
  QuestionDefinition,
} from "@/domain/diagnostic/types";

import { GoalQuestion } from "./goal-question";
import { MultiChoiceQuestion } from "./multi-choice-question";
import { NumericQuestion } from "./numeric-question";
import { SingleChoiceQuestion } from "./single-choice-question";
import { TextQuestion } from "./text-question";

type Props = {
  question: QuestionDefinition;
  answer?: DiagnosticAnswer;
  otherAnswer?: DiagnosticAnswer;
  primaryGoal?: Goal;
  onAnswer: (answer: DiagnosticAnswer) => void;
  onOtherAnswer: (answer: string) => void;
  onGoalSelection: (goals: Goal[]) => void;
  onPrimaryGoal: (goal: Goal) => void;
};

export function QuestionRenderer({
  question,
  answer,
  otherAnswer,
  primaryGoal,
  onAnswer,
  onOtherAnswer,
  onGoalSelection,
  onPrimaryGoal,
}: Props) {
  const selectedValues = Array.isArray(answer) ? answer : [];
  const selectedSingle = typeof answer === "string" ? answer : undefined;
  const hasOther = question.otherOptionValue
    ? selectedValues.includes(question.otherOptionValue) ||
      selectedSingle === question.otherOptionValue
    : false;

  return (
    <div className="space-y-5">
      {question.id === "Q001" ? (
        <GoalQuestion
          question={question}
          selected={selectedValues as Goal[]}
          primaryGoal={primaryGoal}
          onSelectionChange={onGoalSelection}
          onPrimaryChange={onPrimaryGoal}
        />
      ) : question.kind === "multi" ? (
        <MultiChoiceQuestion
          question={question}
          value={selectedValues}
          onChange={onAnswer}
        />
      ) : question.kind === "single" ? (
        <SingleChoiceQuestion
          question={question}
          value={selectedSingle}
          onChange={onAnswer}
        />
      ) : question.kind === "numeric" ? (
        <NumericQuestion
          question={question}
          value={typeof answer === "number" ? answer : undefined}
          onChange={onAnswer}
        />
      ) : (
        <TextQuestion
          question={question}
          value={selectedSingle}
          onChange={onAnswer}
        />
      )}

      {hasOther ? (
        <Input
          id={`answer-${question.id}-other`}
          label={question.otherInputLabel ?? "Conte em poucas palavras"}
          value={typeof otherAnswer === "string" ? otherAnswer : ""}
          maxLength={160}
          autoComplete="off"
          onChange={(event) => onOtherAnswer(event.currentTarget.value)}
        />
      ) : null}
    </div>
  );
}
