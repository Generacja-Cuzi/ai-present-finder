import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export const userAtom = atomWithStorage<User | null>("auth:user", null);

export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);

export const oauthHandledAtom = atomWithStorage<boolean>(
  "oauth:google:handled",
  false,
);
