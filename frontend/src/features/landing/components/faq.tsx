import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "Jak działa wyszukiwarka prezentów AI?",
    answer:
      "Nasza AI analizuje profile w mediach społecznościowych i odpowiedzi z czatu, aby zrozumieć zainteresowania, hobby i osobowość odbiorcy. Następnie przeszukuje tysiące produktów, aby znaleźć spersonalizowane rekomendacje prezentów, które pasują do ich unikalnego profilu.",
    value: "item-1",
  },
  {
    question: "Jakie platformy społecznościowe obsługujecie?",
    answer:
      "Obecnie obsługujemy główne platformy społecznościowe, w tym Instagram, Twitter i TikTok. Wystarczy podać linki do profili podczas procesu konfiguracji, a nasza AI zbierze odpowiednie informacje.",
    value: "item-2",
  },
  {
    question: "Czy moje dane i prywatność są chronione?",
    answer:
      "Absolutnie. Poważnie traktujemy prywatność. Cała analiza mediów społecznościowych jest wykonywana bezpiecznie i mamy dostęp tylko do publicznie dostępnych informacji. Twoje dane są zaszyfrowane i nigdy nie są udostępniane stronom trzecim. Możesz usunąć swoje dane w dowolnym momencie.",
    value: "item-3",
  },
  {
    question: "Czy mogę filtrować rekomendacje prezentów?",
    answer:
      "Tak! Po otrzymaniu spersonalizowanych rekomendacji możesz filtrować wyniki według zakresu cen, kategorii, okazji, opcji wysyłki i innych. Możesz również zapisać ulubione, aby porównać je później.",
    value: "item-4",
  },
  {
    question: "Jak dokładne są rekomendacje prezentów?",
    answer:
      "Nasza AI łączy informacje z mediów społecznościowych z kontekstem rozmowy, aby zapewnić bardzo dokładne rekomendacje. Im więcej informacji podasz podczas czatu, tym lepsze sugestie. Większość użytkowników znajdzie swój idealny prezent w pierwszych 10 rekomendacjach.",
    value: "item-5",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="container py-8 sm:py-12">
      <h2 className="mb-4 text-3xl font-bold md:text-4xl">
        Najczęściej zadawane{" "}
        <span className="from-primary/60 to-primary bg-gradient-to-b bg-clip-text text-transparent">
          pytania
        </span>
      </h2>

      <Accordion type="single" collapsible className="AccordionRoot w-full">
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
