import { useLocation, useNavigate } from "@tanstack/react-router";
import { Bookmark, History, Search, User } from "lucide-react";

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Search, label: "Search", path: "/" },
    { icon: Bookmark, label: "Saved", path: "/saved" },
    { icon: History, label: "History", path: "/history" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-white">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={async () => navigate({ to: item.path })}
              className="flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors hover:bg-gray-50"
            >
              <Icon
                className={`h-6 w-6 ${active ? "text-orange-500" : "text-gray-400"}`}
              />
              <span
                className={`text-xs ${active ? "font-medium text-orange-500" : "text-gray-600"}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
