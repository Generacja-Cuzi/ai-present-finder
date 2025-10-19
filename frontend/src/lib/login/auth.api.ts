import { $api } from "../api/client";

export const useGoogleAuthUrl = () => {
  return $api.useQuery("get", "/auth/google/url");
};

export const useGoogleCallback = () => {
  return $api.useMutation("post", "/auth/google/callback");
};

export const useCurrentUser = () => {
  return $api.useQuery("get", "/auth/me");
};

export const useLogout = () => {
  return $api.useMutation("post", "/auth/logout");
};
