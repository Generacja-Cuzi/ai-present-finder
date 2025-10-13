export type GiftSearchingState =
  | {
      type: "searching";
    }
  | {
      type: "ready";
      data: {
        recommendations: Recommendation[];
      };
    };

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  price?: number;
}

export interface GiftSearchingSseMessage {
  type: "recommendation-ready";
  recommendations: Recommendation[];
}
