import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface User {
  id: string;
  email: string;
  name: string | null;
}

// Atom przechowujący dane użytkownika w localStorage
export const userAtom = atomWithStorage<User | null>("auth:user", null);

// Atom obliczeniowy sprawdzający czy użytkownik jest zalogowany
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);

// Atom do sprawdzenia czy OAuth callback został już obsłużony
export const oauthHandledAtom = atomWithStorage<boolean>(
  "oauth:google:handled",
  false,
);
