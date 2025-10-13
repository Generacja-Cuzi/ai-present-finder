import { SseProvider } from "@/lib/sse";

import { useSseRecommendation } from "../hooks/use-sse-finding";

export function RecommendationView({ clientId }: { clientId: string }) {
  return (
    <SseProvider clientId={clientId}>
      <RecommendationContent clientId={clientId} />
    </SseProvider>
  );
}

function RecommendationContent({ clientId }: { clientId: string }) {
  const { state } = useSseRecommendation({ clientId });

  switch (state.type) {
    case "idle": {
      return <div>Waiting for recommendations...</div>;
    }

    case "generating": {
      return <div>Generating recommendations...</div>;
    }

    case "error": {
      return <div>Error: {state.error}</div>;
    }

    case "ready": {
      return (
        <div>
          <h2>Recommendations</h2>
          <ul>
            {state.data.recommendations.map((rec) => (
              <li key={rec.id}>
                <h3>{rec.title}</h3>
                <p>{rec.description}</p>
                {typeof rec.price === "number" ? (
                  <span>Price: ${rec.price}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    default: {
      const _exhaustiveCheck: never = state;
      return _exhaustiveCheck;
    }
  }
}
