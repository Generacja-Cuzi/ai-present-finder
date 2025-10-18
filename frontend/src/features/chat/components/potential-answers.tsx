import { Button } from "@/components/ui/button";
import type { components } from "@/lib/api/types";

type PotentialAnswer = components["schemas"]["PotencialAnswerChoiceDto"];

export function PotentialAnswers({
  answers,
  onAnswerSelect,
}: {
  answers: PotentialAnswer[];
  onAnswerSelect: (answer: string) => void;
}) {
  return (
    <div className="mx-2 flex flex-col gap-2 rounded-t-2xl p-4 pt-2">
      {answers.map((answer) => (
        <Button
          variant="outline"
          size="lg"
          key={answer.answerShortForm}
          onClick={() => {
            onAnswerSelect(answer.answerFullSentence);
          }}
          className="justify-start rounded-2xl"
        >
          {answer.answerShortForm}
        </Button>
      ))}
    </div>
  );
}
