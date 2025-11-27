import createFetchClient from "openapi-fetch";
import type { Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";

import { getBackendUrl } from "../backend-url";
import { refreshAccessToken } from "../login/refresh-token";
import type { paths } from "./types";

// Store request bodies for retry
const requestBodies = new WeakMap<Request, BodyInit>();

const refreshTokenMiddleware: Middleware = {
  async onRequest({ request }) {
    // Store body before request is sent (for potential retry)
    if (request.body !== null) {
      const clonedRequest = request.clone();
      const bodyText = await clonedRequest.text();
      if (bodyText) {
        requestBodies.set(request, bodyText);
      }
    }
    return request;
  },

  async onResponse({ request, response }) {
    // Skip refresh token endpoint to avoid infinite loop
    if (response.url.includes("/auth/refresh")) {
      return response;
    }

    if (response.status === 401) {
      // Try to refresh the token
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        // Get stored body if it exists
        const storedBody = requestBodies.get(request);

        // Retry the original request with new token
        const retryResponse = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: storedBody,
          credentials: "include",
        });

        // Clean up stored body
        requestBodies.delete(request);

        return retryResponse;
      } else {
        // Redirect to login if refresh failed
        window.location.href = "/login";
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
