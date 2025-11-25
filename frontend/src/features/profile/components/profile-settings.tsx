import { ChevronRight, HelpCircle, Mail, Shield } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionContainer } from "@/components/ui/section-container";

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
}

function SettingItem({ icon, title, onClick }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg bg-white px-4 py-4 transition-colors hover:bg-amber-50"
    >
      <div className="flex items-center gap-3">
        <div className="text-gray-600">{icon}</div>
        <span className="text-base font-medium text-gray-900">{title}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </button>
  );
}

export function ProfileSettings() {
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  const handlePrivacy = () => {
    setShowPrivacyDialog(true);
  };

  const handleHelp = () => {
    setShowHelpDialog(true);
  };

  const handleContact = () => {
    setShowContactDialog(true);
  };

  return (
    <>
      <div className="space-y-6">
        <SectionContainer title="Ustawienia">
          <SettingItem
            icon={<Shield className="h-5 w-5" />}
            title="Prywatność"
            onClick={handlePrivacy}
          />
        </SectionContainer>

        <SectionContainer title="Wsparcie">
          <SettingItem
            icon={<HelpCircle className="h-5 w-5" />}
            title="Centrum Pomocy"
            onClick={handleHelp}
          />
          <div className="h-px bg-gray-100" />
          <SettingItem
            icon={<Mail className="h-5 w-5" />}
            title="Kontakt"
            onClick={handleContact}
          />
        </SectionContainer>
      </div>

      {/* Privacy Dialog */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Polityka Prywatności</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              Chronimy Twoją prywatność i dane osobowe zgodnie z RODO oraz
              polskim prawem ochrony danych osobowych.
            </p>
            <p className="font-semibold">Zbieramy następujące dane:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Imię i nazwisko (z konta Google)</li>
              <li>Adres email</li>
              <li>Zdjęcie profilowe</li>
              <li>Historia wyszukiwań prezentów</li>
            </ul>
            <p className="font-semibold">Twoje dane:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Są bezpiecznie przechowywane</li>
              <li>Nie są sprzedawane stronom trzecim</li>
              <li>Możesz je w każdej chwili usunąć</li>
            </ul>
          </div>
          <Button
            onClick={() => {
              setShowPrivacyDialog(false);
            }}
            className="mt-6 w-full"
          >
            Rozumiem
          </Button>
        </DialogContent>
      </Dialog>

      {/* Help Center Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Centrum Pomocy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Jak działa AI Present Finder?
              </h3>
              <p>
                Nasza aplikacja wykorzystuje sztuczną inteligencję do analizy
                profili społecznościowych i rozmowy z Tobą, aby znaleźć idealny
                prezent dla Twoich bliskich.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Jak rozpocząć wyszukiwanie?
              </h3>
              <p>
                1. Podaj link do profilu osoby
                <br />
                2. Odpowiedz na pytania asystenta
                <br />
                3. Otrzymaj spersonalizowane propozycje prezentów
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Potrzebujesz więcej pomocy?
              </h3>
              <p>
                Skontaktuj się z nami przez formularz kontaktowy lub napisz na
                adres: help@aipresentfinder.com
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setShowHelpDialog(false);
            }}
            className="mt-6 w-full"
          >
            Zamknij
          </Button>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kontakt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Masz pytania? Napisz do nas!
              </h3>
              <p>
                Chętnie odpowiemy na wszystkie Twoje pytania i pomożemy
                rozwiązać ewentualne problemy.
              </p>
            </div>
            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Email:</span>
              </div>
              <a
                href="mailto:kontakt@aipresentfinder.com"
                className="block text-amber-600 hover:text-amber-700 hover:underline"
              >
                kontakt@aipresentfinder.com
              </a>
            </div>
            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Wsparcie techniczne:</span>
              </div>
              <a
                href="mailto:support@aipresentfinder.com"
                className="block text-amber-600 hover:text-amber-700 hover:underline"
              >
                support@aipresentfinder.com
              </a>
            </div>
            <p className="text-xs text-gray-500">
              Odpowiadamy zazwyczaj w ciągu 24 godzin w dni robocze.
            </p>
          </div>
          <Button
            onClick={() => {
              setShowContactDialog(false);
            }}
            className="mt-6 w-full"
          >
            Zamknij
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
