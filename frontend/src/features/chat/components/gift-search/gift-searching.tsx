import { useEffect, useState } from "react";

import { GiftIcon } from "./gift-icon";
import { SearchMessage } from "./search-message";
import { SearchProgress } from "./search-progress";
import { SearchingLayout } from "./searching-layout";

export function GiftSearching() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const maxDuration = 60_000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsed / maxDuration) * 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <SearchingLayout title="Szukanie idealnego prezentu">
      <div className="mb-16 flex justify-center">
        <GiftIcon />
      </div>

      <SearchProgress progress={progress} />

      <SearchMessage message="Analizujemy głęboko ich zainteresowania, hobby i poprzednie prezenty, aby znaleźć coś naprawdę specjalnego." />
    </SearchingLayout>
  );
}
