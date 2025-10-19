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
}

export interface ListingWithId extends ListingPayload {
  listingId: string;
}
