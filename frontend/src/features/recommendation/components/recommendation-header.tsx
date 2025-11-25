import { PageHeader } from "@/components/ui/page-header";

interface RecommendationHeaderProps {
  backTo?: string;
}

export function RecommendationHeader({
  backTo = "/start-search",
}: RecommendationHeaderProps) {
  return <PageHeader title="Rekomendacje prezentów" backTo={backTo} sticky />;
}
