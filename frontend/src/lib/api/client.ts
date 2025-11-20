import createFetchClient from "openapi-fetch";
import type { Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";

import { getBackendUrl } from "../backend-url";
import { refreshAccessToken } from "../login/refresh-token";
import type { paths } from "./types";

const refreshTokenMiddleware: Middleware = {
  async onResponse({ response }) {
    if (response.status === 401) {
      // Try to refresh the token
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        // Retry the original request with new token
        const retryResponse = await fetch(response.url, {
          method: response.headers.get("X-HTTP-Method") ?? "GET",
          credentials: "include",
        });
        return retryResponse;
      }
    }
    return response;
  },
};

export const fetchClient = createFetchClient<paths>({
  baseUrl: getBackendUrl(),
  credentials: "include",
});

fetchClient.use(refreshTokenMiddleware);

export const $api = createClient(fetchClient);
