import type { paths } from "@/lib/api/types";

type UserProfile =
  paths["/user-profiles"]["get"]["responses"]["200"]["content"]["application/json"]["profiles"][number];

export function ProfileCardFooter({
  profile,
  onSelect,
}: {
  profile: UserProfile;
  onSelect: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t pt-2">
      <p className="text-muted-foreground text-xs">
        Utworzono:{" "}
        {new Date(profile.createdAt).toLocaleDateString("pl-PL", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <span
        className="text-primary text-sm transition-transform group-hover:translate-x-1"
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            onSelect();
          }
        }}
        role="button"
        tabIndex={0}
      >
        →
      </span>
    </div>
  );
}
