import { cn } from "@/lib/utils";

export function Avatar({
  src,
  alt = "Avatar",
  className,
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  const hasValidSource = src !== undefined && src.length > 0;

  return (
    <div
      className={cn(
        "bg-muted flex size-10 items-center justify-center overflow-hidden rounded-full",
        className,
      )}
    >
      {hasValidSource ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <div className="from-primary/20 to-primary/40 flex size-full items-center justify-center bg-gradient-to-br">
          <span className="text-primary text-sm font-semibold">
            {alt.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
