import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function TypingIndicator() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex gap-3 duration-300">
      <Avatar alt="AI Present Finder" className="mt-1 flex-shrink-0" />
      <div className="bg-secondary flex items-center gap-1 rounded-2xl px-5 py-4">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={cn(
              "bg-primary/70 size-2.5 rounded-full",
              "animate-[wave_1.2s_ease-in-out_infinite]",
            )}
            style={{
              animationDelay: `${String(index * 0.15)}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
