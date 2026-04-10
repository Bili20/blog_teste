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
  author: AuthenticatedUser;
}

export interface AuthState {
  accessToken: string | null;
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
}
