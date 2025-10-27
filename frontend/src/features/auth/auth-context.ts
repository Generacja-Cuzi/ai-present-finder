import { createContext } from "react";

import type { AuthState } from "./auth-provider";

export const AuthContext = createContext<AuthState | undefined>(undefined);
