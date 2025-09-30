import { z } from "zod";

export function getBackendUrl() {
  return z
    .string()
    .trim()
    .parse(import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000");
}
