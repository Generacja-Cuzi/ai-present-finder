import { GiftIcon } from "./gift-icon";
import { SearchMessage } from "./search-message";
import { SearchProgress } from "./search-progress";
import { SearchingLayout } from "./searching-layout";

export function GiftSearching({
  progress,
  message,
}: {
  progress: number;
  message: string;
}) {
  return (
    <SearchingLayout title="Szukanie idealnego prezentu">
      <div className="mb-16 flex justify-center">
        <GiftIcon />
      </div>

      <SearchProgress progress={progress} isComplete={progress >= 100} />

      <SearchMessage message={message} />
    </SearchingLayout>
  );
}
