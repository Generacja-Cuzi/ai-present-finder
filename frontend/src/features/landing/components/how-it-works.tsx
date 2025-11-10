import {
  GiftIcon,
  LinkIcon,
  MessageCircleIcon,
  SearchIcon,
} from "lucide-react";
import type { JSX } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <LinkIcon />,
    title: "Udostępnij linki społecznościowe",
    description:
      "Podaj profile społecznościowe odbiorcy, aby pomóc nam zrozumieć jego zainteresowania, hobby i osobowość.",
  },
  {
    icon: <MessageCircleIcon />,
    title: "Porozmawiaj z AI",
    description:
      "Odpowiedz na kilka przyjaznych pytań o osobę, która otrzyma prezent. Nasza AI uczy się jej preferencji poprzez rozmowę.",
  },
  {
    icon: <SearchIcon />,
    title: "Wyszukiwanie napędzane AI",
    description:
      "Nasz inteligentny system przeszukuje i analizuje tysiące opcji prezentów, aby znaleźć idealne dopasowania na podstawie profilu.",
  },
  {
    icon: <GiftIcon />,
    title: "Filtruj i wybieraj",
    description:
      "Przeglądaj spersonalizowane rekomendacje prezentów, filtruj według ceny, kategorii lub okazji i wybierz idealny prezent.",
  },
];

export function HowItWorks() {
  return (
    <section id="howItWorks" className="container py-8 text-center sm:py-12">
      <h2 className="text-3xl font-bold md:text-4xl">
        Jak to{" "}
        <span className="from-primary/60 to-primary bg-gradient-to-b bg-clip-text text-transparent">
          działa{" "}
        </span>
        - przewodnik krok po kroku
      </h2>
      <p className="text-muted-foreground mx-auto mb-8 mt-4 text-xl md:w-3/4">
        Znajdź idealny prezent w czterech prostych krokach. Nasza platforma
        napędzana AI sprawia, że wręczanie prezentów jest bezwysiłkowe i
        spersonalizowane.
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card key={title} className="bg-muted/50">
            <CardHeader>
              <CardTitle className="grid place-items-center gap-4">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
