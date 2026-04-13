import { useCallback, useMemo, useState, type ReactNode } from "react";
import type {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
} from "@/types/auth";
import { AuthContext } from "@/contexts/AuthContext";
import {
  getCurrentUser,
  getStoredAccessToken,
  getStoredUser,
  login as loginRequest,
  logout as clearSession,
  persistAccessToken,
  persistUser,
} from "@/services/authService";

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthState {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  isLoading: boolean;
}

function getInitialAuthState(): AuthState {
  if (typeof window === "undefined") {
    return {
      user: null,
      accessToken: null,
      isLoading: true,
    };
  }

  return {
    accessToken: getStoredAccessToken(),
    user: getStoredUser(),
    isLoading: false,
  };
}

export function AuthProvider({
  children,
}: AuthProviderProps): React.JSX.Element {
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState);

  const login = useCallback(
    async (credentials: LoginRequest): Promise<LoginResponse> => {
      setAuthState((currentAuthState) => ({
        ...currentAuthState,
        isLoading: true,
      }));

      try {
        const session = await loginRequest(credentials);

        persistAccessToken(session.accessToken);

        const currentUser = await getCurrentUser();

        persistUser(currentUser);

        setAuthState({
          accessToken: session.accessToken,
          user: currentUser,
          isLoading: false,
        });

        return {
          accessToken: session.accessToken,
        };
      } catch (error) {
        clearSession();
        setAuthState({
          accessToken: null,
          user: null,
          isLoading: false,
        });
        throw error;
      }
    },
    [],
  );

  const refreshSession = useCallback(async (): Promise<void> => {
    const storedAccessToken = getStoredAccessToken();

    if (!storedAccessToken) {
      clearSession();
      setAuthState({
        accessToken: null,
        user: null,
        isLoading: false,
      });
      return;
    }

    setAuthState((currentAuthState) => ({
      ...currentAuthState,
      accessToken: storedAccessToken,
      isLoading: true,
    }));

    try {
      const currentUser = await getCurrentUser();

      persistUser(currentUser);

      setAuthState({
        accessToken: storedAccessToken,
        user: currentUser,
        isLoading: false,
      });
    } catch {
      clearSession();
      setAuthState({
        accessToken: null,
        user: null,
        isLoading: false,
      });
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();

    setAuthState({
      accessToken: null,
      user: null,
      isLoading: false,
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      user: authState.user,
      accessToken: authState.accessToken,
      isAuthenticated: Boolean(authState.accessToken && authState.user),
      isLoading: authState.isLoading,
      login,
      logout,
      refreshSession,
    }),
    [authState, login, logout, refreshSession],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
