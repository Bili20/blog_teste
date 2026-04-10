import { createContext } from "react";
import type { AuthenticatedUser, LoginRequest, LoginResponse } from "@/types/auth";

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
