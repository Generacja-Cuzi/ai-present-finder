import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { components } from "@/lib/api/types";

interface ReasoningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatName?: string;
  reasoningSummary: {
    recipientProfile?: components["schemas"]["RecipientProfileDto"];
    keyThemesAndKeywords?: string[];
  } | null;
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

              {reasoningSummary.recipientProfile.personal_info !==
                undefined && (
                <InfoSection
                  title="Informacje osobiste"
                  data={reasoningSummary.recipientProfile.personal_info}
                />
              )}

              {reasoningSummary.recipientProfile.lifestyle !== undefined && (
                <InfoSection
                  title="Styl życia"
                  data={reasoningSummary.recipientProfile.lifestyle}
                />
              )}

              {reasoningSummary.recipientProfile.preferences !== undefined && (
                <InfoSection
                  title="Preferencje"
                  data={reasoningSummary.recipientProfile.preferences}
                />
              )}

              {reasoningSummary.recipientProfile.media_interests !==
                undefined && (
                <InfoSection
                  title="Zainteresowania medialne"
                  data={reasoningSummary.recipientProfile.media_interests}
                />
              )}

              {reasoningSummary.recipientProfile.recent_life !== undefined && (
                <InfoSection
                  title="Ostatnie wydarzenia"
                  data={reasoningSummary.recipientProfile.recent_life}
                />
              )}

              {reasoningSummary.recipientProfile.gift_context !== undefined && (
                <InfoSection
                  title="Kontekst prezentu"
                  data={reasoningSummary.recipientProfile.gift_context}
                />
              )}
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

function InfoSection({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown>;
}) {
  const entries = Object.entries(data).filter(
    ([, value]) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      (Array.isArray(value) ? value.length > 0 : true),
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <h4 className="mb-2 text-sm font-medium text-gray-700">{title}</h4>
      <dl className="space-y-1">
        {entries.map(([key, value]) => (
          <div key={key} className="text-sm">
            <dt className="inline font-medium text-gray-600">
              {formatLabel(key)}:{" "}
            </dt>
            <dd className="inline text-gray-900">{formatValue(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function formatLabel(key: string): string {
  return key
    .replaceAll("_", " ")
    .replaceAll(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
}
