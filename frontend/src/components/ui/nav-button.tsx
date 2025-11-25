import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NavButton({
  to,
  search,
  label,
  icon = <ArrowLeft className="text-foreground size-6" />,
  className = "",
}: {
  to: string;
  search?: Record<string, string>;
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
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <Link to={to} search={search}>
        {label} {icon}
      </Link>
    </Button>
  );
}
