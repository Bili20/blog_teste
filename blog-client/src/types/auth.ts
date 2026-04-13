export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginResponse = void;

export type RefreshSessionResponse = void;

export interface CurrentUserResponse {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
