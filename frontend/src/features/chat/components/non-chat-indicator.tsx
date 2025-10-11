import type { ChatState } from "../types";

export function NonChatIndicator({
  state,
}: {
  state: Exclude<ChatState, { type: "chatting" }>;
}) {
  if (state.type === "waiting-for-gift-ideas") {
    return (
      <div className="flex h-[90vh] items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold">Interview Complete! 🎉</div>
          <div className="mt-2 text-gray-600">
            Generating personalized gift ideas for you...
          </div>
          <div className="mt-4 text-4xl">🎁</div>
        </div>
      </div>
    );
  }

  if (state.type === "gift-ready") {
    return (
      <div className="p-8">
        <div className="text-2xl font-bold">Gift Ideas Ready! 🎁</div>
        <div className="mt-4 space-y-4">
          {state.data.giftIdeas.map((gift) => (
            <div
              key={gift.link || gift.title}
              className="rounded-lg border p-4"
            >
              {gift.image !== null && gift.image.length > 0 ? (
                <img
                  src={gift.image}
                  alt={gift.title}
                  className="mb-2 h-48 w-full rounded object-cover"
                />
              ) : null}
              <h3 className="text-lg font-semibold">{gift.title}</h3>
              {gift.description.length > 0 ? (
                <p className="mt-2 text-gray-600">{gift.description}</p>
              ) : null}
              <a
                href={gift.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                View Product →
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[90vh] items-center justify-center">
      <div className="text-center">
        <div className="text-xl font-semibold text-red-600">
          ⚠️ Inappropriate Request Detected
        </div>
        <div className="mt-2 text-gray-600">{state.data.reason}</div>
      </div>
    </div>
  );
}
