import { Progress } from "@/components/ui/progress";

export function SearchProgress({
  progress,
  isComplete = false,
}: {
  progress: number;
  isComplete?: boolean;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2">
        <p className="text-foreground/70 text-lg font-medium">
          {isComplete ? "Complete!" : "Analyzing preferences"}
        </p>
      </div>

      <Progress value={progress} max={100} className="bg-muted h-2" />
    </div>
  );
}
