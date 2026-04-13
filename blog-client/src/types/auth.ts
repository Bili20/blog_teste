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

export interface LoginResponse {
  accessToken: string;
}

export interface CurrentUserResponse {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface AuthState {
  accessToken: string | null;
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
