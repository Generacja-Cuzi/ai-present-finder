import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { components } from "@/lib/api/types";

type PotentialAnswer = components["schemas"]["PotencialAnswerChoiceDto"];

export function PotentialAnswers({
  answers,
  onAnswerSelect,
}: {
  answers: PotentialAnswer[];
  onAnswerSelect: (answer: string) => void;
}) {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState("");

  const handleOtherSubmit = () => {
    if (otherValue.trim()) {
      onAnswerSelect(otherValue.trim());
      setOtherValue("");
      setShowOtherInput(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleOtherSubmit();
    }
    if (event.key === "Escape") {
      setShowOtherInput(false);
      setOtherValue("");
    }
  };

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

      {showOtherInput ? (
        <div className="flex gap-2">
          <Input
            value={otherValue}
            onChange={(event) => {
              setOtherValue(event.target.value);
            }}
            onKeyDown={handleKeyPress}
            placeholder="Wpisz swoją odpowiedź..."
            className="flex-1 rounded-2xl"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          <Button
            onClick={handleOtherSubmit}
            disabled={!otherValue.trim()}
            className="rounded-2xl"
          >
            Wyślij
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowOtherInput(false);
              setOtherValue("");
            }}
            className="rounded-2xl"
          >
            Anuluj
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            setShowOtherInput(true);
          }}
          className="justify-start rounded-2xl"
        >
          Inne...
        </Button>
      )}
    </div>
  );
}
