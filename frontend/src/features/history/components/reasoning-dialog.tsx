import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { components } from "@/lib/api/types";
import { formatRecipientProfile } from "@/lib/utils/recipient-profile-translator";

interface ReasoningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatName?: string;
  reasoningSummary?:
    | {
        recipientProfile?: components["schemas"]["RecipientProfileDto"];
        keyThemesAndKeywords?: string[];
      }
    | null
    | undefined;
}

export function ReasoningDialog({
  open,
  onOpenChange,
  chatName,
  reasoningSummary,
}: ReasoningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Tok myślowy
            {chatName !== undefined && chatName !== "" ? ` - ${chatName}` : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {reasoningSummary?.keyThemesAndKeywords !== undefined &&
            reasoningSummary.keyThemesAndKeywords.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  Kluczowe tematy i słowa kluczowe
                </h3>
                <div className="flex flex-wrap gap-2">
                  {reasoningSummary.keyThemesAndKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {reasoningSummary?.recipientProfile !== undefined && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Profil odbiorcy</h3>

              <div className="space-y-2">
                {formatRecipientProfile(reasoningSummary.recipientProfile).map(
                  ({ label, value }) => (
                    <div key={label} className="rounded-lg bg-gray-50 p-3">
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                        {label}
                      </h4>
                      <p className="text-sm leading-relaxed text-gray-900">
                        {value}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {reasoningSummary == null ? (
            <p className="text-center text-gray-500">
              Brak dostępnych informacji o toku myślowym.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
