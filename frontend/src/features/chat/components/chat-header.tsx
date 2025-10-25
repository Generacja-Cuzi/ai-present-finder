import { NavButton } from "@/components/ui/nav-button";
import { Progress } from "@/components/ui/progress";

export function ChatHeader({
  currentStep,
  totalSteps = 10,
}: {
  currentStep: number;
  totalSteps?: number;
}) {
  return (
    <div className="bg-background flex-shrink-0 border-b">
      <div className="flex items-center justify-between">
        <NavButton to="/" />
        <h1 className="text-xl font-semibold">New Gift</h1>
        <div className="size-10" />
      </div>
      <div className="px-4 pb-4">
        <div className="text-muted-foreground mb-2 text-sm">
          {currentStep}/{totalSteps}
        </div>
        <Progress value={currentStep} max={totalSteps} />
      </div>
    </div>
  );
}
