import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

import { getBackendUrl } from "../backend-url";
import type { paths } from "./types";

export const fetchClient = createFetchClient<paths>({
  baseUrl: getBackendUrl(),
  credentials: "include",
});

export const $api = createClient(fetchClient);
