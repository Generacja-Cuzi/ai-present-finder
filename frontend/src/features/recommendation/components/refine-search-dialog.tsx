import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RefineSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function RefineSearchDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
  isLoading = false,
}: RefineSearchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Doprecyzuj wyszukiwanie
          </DialogTitle>
          <DialogDescription>
            Wybrałeś {selectedCount}{" "}
            {selectedCount === 1 ? "prezent" : "prezentów"},{" "}
            {selectedCount < 5 ? "które" : "których"} Ci się{" "}
            {selectedCount === 1 ? "podoba" : "podobają"}. Zadamy Ci kilka
            dodatkowych pytań, aby jeszcze lepiej dopasować rekomendacje.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="rounded-lg bg-purple-50 p-4">
            <p className="text-sm text-gray-700">
              <strong>Co się stanie?</strong>
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
              <li>Zadamy 3-5 krótkich pytań o wybrane prezenty</li>
              <li>Dowiadamy się, co w nich najbardziej Ci się podoba</li>
              <li>Wygenerujemy nowe, lepiej dopasowane wyniki</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            Anuluj
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>Rozpoczynanie...</>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Rozpocznij doprecyzowanie
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
