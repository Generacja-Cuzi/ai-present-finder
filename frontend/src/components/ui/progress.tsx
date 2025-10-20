import { cn } from "@/lib/utils";

export function Progress({
  value,
  max = 100,
  className,
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const percentage = (value / max) * 100;

  return (
    <div
      className={cn(
        "bg-secondary border-border h-1.5 w-full overflow-hidden rounded-full border",
        className,
      )}
    >
      <div
        className="bg-primary h-full transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
