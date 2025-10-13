import { Link as RouterLink } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export function StalkingHeader() {
  return (
    <div className="relative flex items-center justify-center border-b border-gray-200 px-4 py-4">
      <Button
        asChild
        className="bg-background absolute left-4 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
        aria-label="Go back"
      >
        <RouterLink to="/">
          <ArrowLeft className="text-foreground size-6" />
        </RouterLink>
      </Button>
      <h1 className="text-foreground text-xl font-bold">
        Find the perfect gift
      </h1>
    </div>
  );
}
