export interface ListingPayload {
  image: string | null;
  title: string;
  description: string;
  link: string;
  price: {
    value: number | null;
    label: string | null;
    currency: string | null;
    negotiable: boolean | null;
  };
  category?: string | null;
}

export interface ListingWithId extends ListingPayload {
  listingId: string;
}
