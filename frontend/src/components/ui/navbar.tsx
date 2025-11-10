import { Link, useRouterState } from "@tanstack/react-router";
import { Bookmark, History, Search, User } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  {
    icon: Search,
    label: "Szukaj",
    path: "/start-search",
  },
  {
    icon: Bookmark,
    label: "Zapisane",
    path: "/saved",
  },
  {
    icon: History,
    label: "Historia",
    path: "/history",
  },
  {
    icon: User,
    label: "Profil",
    path: "/profile",
  },
] as const;

export function Navbar() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <nav className="bg-background fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200">
      <div className="mx-auto flex max-w-lg items-center justify-around px-6 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              href={item.path}
              className="flex flex-col items-center gap-1"
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-colors",
                  isActive ? "text-primary" : "text-gray-500",
                )}
              />
              <span
                className={cn(
                  "text-xs transition-colors",
                  isActive ? "text-primary" : "text-gray-500",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
