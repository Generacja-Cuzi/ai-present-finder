import { Button } from "@/components/ui/button";

interface SubmitBarProps {
  disabled: boolean;
  isPending: boolean;
}

export function SubmitBar({ disabled, isPending }: SubmitBarProps) {
  return (
    <div className="fixed bottom-20 left-0 right-0 bg-transparent px-6 py-4 shadow-none">
      <Button
        type="submit"
        disabled={disabled}
        className="bg-brand text-brand-foreground hover:bg-brand/90 w-full rounded-full py-6 text-lg font-semibold shadow-lg transition-all active:scale-95 disabled:bg-gray-300 disabled:text-gray-500"
      >
        {isPending ? "Starting..." : "Find Gift Ideas"}
      </Button>
    </div>
  );
}
