import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NavButton({
  to,
  label,
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
      className={`bg-background flex items-center justify-center rounded-full text-black transition-colors hover:bg-gray-100 ${className}`}
      aria-label={label}
    >
      <Link to={to} href={to}>
        {label} {icon}
      </Link>
    </Button>
  );
}
