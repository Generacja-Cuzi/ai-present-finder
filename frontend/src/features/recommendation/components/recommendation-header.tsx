import { NavButton } from "@/components/ui/nav-button";

export function RecommendationHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-4 py-3">
      <NavButton to="/" />
      <h1 className="text-lg font-semibold">Gift Recommendations</h1>
    </header>
  );
}
