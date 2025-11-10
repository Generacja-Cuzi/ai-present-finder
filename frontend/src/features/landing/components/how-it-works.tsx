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
    title: "Share Social Links",
    description:
      "Provide the recipient's social media profiles to help us understand their interests, hobbies, and personality.",
  },
  {
    icon: <MessageCircleIcon />,
    title: "Chat with AI",
    description:
      "Answer a few friendly questions about the person receiving the gift. Our AI learns their preferences through conversation.",
  },
  {
    icon: <SearchIcon />,
    title: "AI-Powered Search",
    description:
      "Our intelligent system searches and analyzes thousands of gift options to find the perfect matches based on the profile.",
  },
  {
    icon: <GiftIcon />,
    title: "Filter & Choose",
    description:
      "Browse personalized gift recommendations, filter by price, category, or occasion, and select the perfect present.",
  },
];

export function HowItWorks() {
  return (
    <section id="howItWorks" className="container py-8 text-center sm:py-12">
      <h2 className="text-3xl font-bold md:text-4xl">
        How It{" "}
        <span className="from-primary/60 to-primary bg-gradient-to-b bg-clip-text text-transparent">
          Works{" "}
        </span>
        Step-by-Step Guide
      </h2>
      <p className="text-muted-foreground mx-auto mb-8 mt-4 text-xl md:w-3/4">
        Find the perfect gift in four simple steps. Our AI-powered platform
        makes gift-giving effortless and personalized.
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
