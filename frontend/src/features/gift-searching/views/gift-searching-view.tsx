import { CustomSseProvider } from "@/lib/sse";

import { useSseGiftSearching } from "../hooks/use-sse-gift-searching";

export function GiftSearchingView({ clientId }: { clientId: string }) {
  return (
    <CustomSseProvider clientId={clientId}>
      <GiftSearchingContent clientId={clientId} />
    </CustomSseProvider>
  );
}

function GiftSearchingContent({ clientId }: { clientId: string }) {
  const { state } = useSseGiftSearching({ clientId });

  switch (state.type) {
    case "searching": {
      return <div>Waiting for recommendations...</div>;
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
