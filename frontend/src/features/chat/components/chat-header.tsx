import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function ChatHeader({
  currentStep,
  totalSteps = 10,
}: {
  currentStep: number;
  totalSteps?: number;
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-background flex-shrink-0 border-b">
      <div className="flex items-center justify-between px-4 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            void navigate({ to: "/" });
          }}
          className="text-foreground"
        >
          <X className="size-6" />
        </Button>
        <h1 className="text-xl font-semibold">New Gift</h1>
        <div className="size-10" /> {/* Spacer for alignment */}
      </div>
      {/* Progress Bar */}
      <div className="px-4 pb-4">
        <div className="text-muted-foreground mb-2 text-sm">
          {currentStep}/{totalSteps}
        </div>
        <Progress value={currentStep} max={totalSteps} />
      </div>
    </div>
  );
}
