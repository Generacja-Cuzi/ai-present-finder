import { BarChart3, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/ui/section-container";

interface ProfileActionsProps {
  isAdmin: boolean;
  onViewFeedback: () => void;
  onLogout: () => Promise<void>;
}

export function ProfileActions({
  isAdmin,
  onViewFeedback,
  onLogout,
}: ProfileActionsProps) {
  return (
    <div className="flex flex-col gap-4">
      {isAdmin ? (
        <SectionContainer title="Administrator">
          <Button
            onClick={onViewFeedback}
            variant="ghost"
            className="w-full justify-start rounded-lg text-base font-medium hover:bg-amber-50"
          >
            <BarChart3 className="mr-3 h-5 w-5" />
            Zobacz opinie
          </Button>
        </SectionContainer>
      ) : null}

      <div className="pt-4">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-center rounded-lg bg-white py-4 text-base font-bold text-red-500 shadow-sm hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-400/10"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Wyloguj się
        </Button>
      </div>
    </div>
  );
}
