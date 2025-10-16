import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

import { getBackendUrl } from "../backend-url";
import type { paths } from "./types";

const fetchClient = createFetchClient<paths>({
  baseUrl: getBackendUrl(),
});

export const $api = createClient(fetchClient);
