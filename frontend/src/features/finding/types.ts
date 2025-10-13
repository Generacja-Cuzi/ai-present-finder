export type RecommendationState =
  | {
      type: "idle";
    }
  | {
      type: "generating";
    }
  | {
      type: "ready";
      data: {
        recommendations: Recommendation[];
      };
    }
  | {
      type: "error";
      error: string;
    };

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  price?: number;
}

export type RecommendationSseMessage =
  | {
      type: "recommendation-generating";
    }
  | {
      type: "recommendation-ready";
      recommendations: Recommendation[];
    }
  | {
      type: "recommendation-error";
      error: string;
    };
