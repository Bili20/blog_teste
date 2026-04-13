import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthenticatedUser, LoginRequest } from "@/types/auth";
import { AuthContext } from "@/contexts/AuthContext";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  refreshAccessToken,
} from "@/services/authService";

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthState {
  user: AuthenticatedUser | null;
  isLoading: boolean;
}

export function AuthProvider({
  children,
}: AuthProviderProps): React.JSX.Element {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });

  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      setAuthState((currentAuthState) => ({
        ...currentAuthState,
        isLoading: true,
      }));

      try {
        await loginRequest(credentials);

        const currentUser = await getCurrentUser();

        setAuthState({
          user: currentUser,
          isLoading: false,
        });

        return;
      } catch (error) {
        setAuthState({
          user: null,
          isLoading: false,
        });
        throw error;
      }
    },
    [],
  );

  const refreshSession = useCallback(async (): Promise<void> => {
    setAuthState((currentAuthState) => ({
      ...currentAuthState,
      isLoading: true,
    }));

    try {
      const currentUser = await getCurrentUser();

      setAuthState({
        user: currentUser,
        isLoading: false,
      });
      return;
    } catch {
      // Ignore and try refresh flow below.
    }

    try {
      await refreshAccessToken();
      const currentUser = await getCurrentUser();

      setAuthState({
        user: currentUser,
        isLoading: false,
      });
    } catch {
      setAuthState({
        user: null,
        isLoading: false,
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setAuthState({
        user: null,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const contextValue = useMemo(
    () => ({
      user: authState.user,
      accessToken: null,
      isAuthenticated: Boolean(authState.user),
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
