import { Avatar } from "@/components/ui/avatar";

export function ThinkingBadge() {
  return (
    <div className="flex gap-3">
      <Avatar alt="AI Present Finder" className="mt-1 flex-shrink-0" />
      <div className="flex animate-pulse items-center space-x-2 rounded-2xl bg-[#F5F1E8] px-5 py-3">
        <div className="flex space-x-1">
          <div className="bg-primary/60 size-2 animate-bounce rounded-full"></div>
          <div
            className="bg-primary/60 size-2 animate-bounce rounded-full"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="bg-primary/60 size-2 animate-bounce rounded-full"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <span className="text-muted-foreground text-sm">Myślę...</span>
      </div>
    </div>
  );
}
