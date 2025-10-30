import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type UserRole = "user" | "admin";

export const UserRole = {
  USER: "user" as const,
  ADMIN: "admin" as const,
};

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export const userAtom = atomWithStorage<User | null>("auth:user", null);

export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);

export const oauthHandledAtom = atomWithStorage<boolean>(
  "oauth:google:handled",
  false,
);
