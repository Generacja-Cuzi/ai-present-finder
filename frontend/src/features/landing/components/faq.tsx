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
    question: "How does the AI gift finder work?",
    answer:
      "Our AI analyzes social media profiles and chat responses to understand the recipient's interests, hobbies, and personality. It then searches through thousands of products to find personalized gift recommendations that match their unique profile.",
    value: "item-1",
  },
  {
    question: "What social media platforms do you support?",
    answer:
      "We currently support major social media platforms including Instagram, Twitter, and TikTok. Simply provide the profile links during the setup process, and our AI will gather relevant insights.",
    value: "item-2",
  },
  {
    question: "Is my data and privacy protected?",
    answer:
      "Absolutely. We take privacy seriously. All social media analysis is done securely, and we only access publicly available information. Your data is encrypted and never shared with third parties. You can delete your data at any time.",
    value: "item-3",
  },
  {
    question: "Can I filter the gift recommendations?",
    answer:
      "Yes! Once you receive your personalized recommendations, you can filter results by price range, category, occasion, shipping options, and more. You can also save favorites to compare later.",
    value: "item-4",
  },
  {
    question: "How accurate are the gift recommendations?",
    answer:
      "Our AI combines social media insights with conversational context to provide highly accurate recommendations. The more information you provide during the chat, the better the suggestions. Most users find their perfect gift within the top 10 recommendations.",
    value: "item-5",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="container py-24 sm:py-32">
      <h2 className="mb-4 text-3xl font-bold md:text-4xl">
        Frequently Asked{" "}
        <span className="from-primary/60 to-primary bg-gradient-to-b bg-clip-text text-transparent">
          Questions
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
