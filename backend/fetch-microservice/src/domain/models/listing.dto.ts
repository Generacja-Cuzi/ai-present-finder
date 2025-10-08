export const listingDtoSchema = {
  image: "string | null",
  title: "string",
  description: "string",
  link: "string",
  price: {
    value: "number | null",
    label: "string | null",
    currency: "string | null",
    negotiable: "boolean | null",
  },
};

export interface ListingDto {
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

export class ListingDtoDocument implements ListingDto {
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
