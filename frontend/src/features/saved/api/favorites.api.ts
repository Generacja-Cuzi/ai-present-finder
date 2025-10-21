import { $api } from "@/lib/api/client";

export function useAddToFavoritesMutation() {
  return $api.useMutation("post", "/favorites");
}

export function useRemoveFromFavoritesMutation() {
  return $api.useMutation("delete", "/favorites/{listingId}");
}

export function useGetFavoritesQuery() {
  return $api.useQuery("get", "/favorites");
}
