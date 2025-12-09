import { cn } from "@/lib/utils";

import { NavButton } from "./nav-button";

interface PageHeaderProps {
  title: string;
  /** Back navigation destination. When provided, shows back button */
  backTo?: string;
  /** Makes header sticky at top */
  sticky?: boolean;
  /** Right-side actions (buttons, etc.) */
  actions?: React.ReactNode;
  /** Custom content below title (progress bar, etc.) */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Unified page header component for all views.
 *
 * Variants:
 * - Centered title (default): Used in profile, saved, stalking views
 * - With back button: Set `backTo` prop for navigation pages
 * - Sticky: Set `sticky` prop for scrollable pages
 * - With actions: Pass `actions` for right-side buttons
 * - With children: Pass custom content like progress bars
 */
export function PageHeader({
  title,
  backTo,
  sticky = false,
  actions,
  children,
  className,
}: PageHeaderProps) {
  const hasNavigation = backTo !== undefined;

  return (
    <header
      className={cn(
        "border-b border-gray-200 bg-white pt-2",
        sticky && "sticky top-0 z-20",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center px-4 py-3",
          hasNavigation ? "justify-between gap-3" : "justify-center",
        )}
      >
        {hasNavigation ? (
          <>
            <div className="flex items-center gap-3">
              <NavButton to={backTo} />
              <h1 className="text-foreground text-lg font-semibold">{title}</h1>
            </div>
            {actions}
          </>
        ) : (
          <>
            <h1 className="text-foreground text-xl font-bold">{title}</h1>
            {actions !== undefined && (
              <div className="absolute right-4">{actions}</div>
            )}
          </>
        )}
      </div>
      {children}
    </header>
  );
}
