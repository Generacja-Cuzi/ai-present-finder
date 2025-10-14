import type { ListingDto } from "@core/types";

export function RecommendationView({
  giftIdeas,
}: {
  clientId: string;
  giftIdeas: ListingDto[];
}) {
  return (
    <div className="p-8">
      <div className="text-2xl font-bold">Gift Ideas Ready! 🎁</div>
      <div className="mt-4 space-y-4">
        {giftIdeas.map((gift) => (
          <div key={gift.link} className="rounded-lg border p-4">
            {gift.image !== null && gift.image.length > 0 ? (
              <img
                src={gift.image}
                alt={gift.title}
                className="mb-2 h-48 w-full rounded object-cover"
              />
            ) : null}
            <h3 className="text-lg font-semibold">{gift.title}</h3>
            {gift.description.length > 0 ? (
              <p className="text-muted-foreground mt-2">{gift.description}</p>
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
