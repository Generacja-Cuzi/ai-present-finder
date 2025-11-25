import { cn } from "@/lib/utils";

interface SectionContainerProps {
  /** Section title (displayed uppercase) */
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Section container with uppercase header and white card wrapper.
 * Used for grouping settings, actions, and other list items.
 *
 * Example:
 * ```tsx
 * <SectionContainer title="Ustawienia">
 *   <SettingItem ... />
 *   <SettingItem ... />
 * </SectionContainer>
 * ```
 */
export function SectionContainer({
  title,
  children,
  className,
}: SectionContainerProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="px-4 text-sm font-bold uppercase tracking-wider text-gray-500">
        {title}
      </h3>
      <div className="space-y-2 rounded-lg bg-white p-2 shadow-sm">
        {children}
      </div>
    </div>
  );
}
