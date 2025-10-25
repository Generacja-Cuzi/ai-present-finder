import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NavButton({
  to,
  label = "Go back",
  icon = <ArrowLeft className="text-foreground size-6" />,
  className = "",
}: {
  to: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      asChild
      className={`bg-background left-4 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 ${className}`}
      aria-label={label}
    >
      <Link to={to} href={to}>
        {label} {icon}
      </Link>
    </Button>
  );
}
