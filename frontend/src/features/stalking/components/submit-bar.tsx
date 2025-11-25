import { Button } from "@/components/ui/button";

interface SubmitBarProps {
  disabled: boolean;
  isPending: boolean;
}

export function SubmitBar({ disabled, isPending }: SubmitBarProps) {
  return (
    <div className="fixed bottom-[72px] left-0 right-0 z-40 px-6 py-4">
      <Button
        type="submit"
        disabled={disabled}
        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-xl py-6 text-lg font-semibold shadow-lg transition-all active:scale-95 disabled:bg-gray-300 disabled:text-gray-500 disabled:opacity-100"
      >
        {isPending ? "Rozpoczynanie..." : "Znajdź pomysły na prezenty"}
      </Button>
    </div>
  );
}
