import { useCallback, useMemo, useState, type ReactNode } from "react";
import type {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
} from "@/types/auth";
import { AuthContext } from "@/contexts/AuthContext";
import {
  getStoredAccessToken,
  getStoredUser,
  login as loginRequest,
  logout as clearSession,
} from "@/services/authService";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface InitialAuthState {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  isLoading: boolean;
}

function getInitialAuthState(): InitialAuthState {
  if (typeof window === "undefined") {
    return {
      user: null,
      accessToken: null,
      isLoading: true,
    };
  }

  const storedAccessToken = getStoredAccessToken();
  const storedUser = getStoredUser();

  if (storedAccessToken && storedUser) {
    return {
      accessToken: storedAccessToken,
      user: storedUser,
      isLoading: false,
    };
  }

  clearSession();

  return {
    user: null,
    accessToken: null,
    isLoading: false,
  };
}

export function AuthProvider({
  children,
}: AuthProviderProps): React.JSX.Element {
  const [authState, setAuthState] =
    useState<InitialAuthState>(getInitialAuthState);

  const login = useCallback(
    async (credentials: LoginRequest): Promise<LoginResponse> => {
      const session = await loginRequest(credentials);

      setAuthState({
        accessToken: session.accessToken,
        user: session.author,
        isLoading: false,
      });

      return session;
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();

    setAuthState({
      accessToken: null,
      user: null,
      isLoading: false,
    });
  }, []);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user: authState.user,
      accessToken: authState.accessToken,
      isAuthenticated: Boolean(authState.accessToken && authState.user),
      isLoading: authState.isLoading,
      login,
      logout,
    }),
    [authState, login, logout],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
