import { AxiosError } from "axios";
import { api, AUTH_TOKEN_STORAGE_KEY } from "@/services/api";
import type {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
} from "@/types/auth";

const AUTH_USER_STORAGE_KEY = "blog.auth.user";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    persistSession(response.data);
    return response.data;
  } catch (error) {
    throw mapAuthError(error);
  }
}

export function logout(): void {
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}

export function persistSession(session: LoginResponse): void {
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, session.accessToken);
  window.localStorage.setItem(
    AUTH_USER_STORAGE_KEY,
    JSON.stringify(session.author),
  );
}

export function getStoredAccessToken(): string | null {
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function getStoredUser(): AuthenticatedUser | null {
  const rawUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthenticatedUser;
  } catch {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
}

export function getStoredSession(): LoginResponse | null {
  const accessToken = getStoredAccessToken();
  const user = getStoredUser();

  if (!accessToken || !user) {
    return null;
  }

  return {
    accessToken,
    author: user,
  };
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredAccessToken() && getStoredUser());
}

export function hasRole(roleName: string): boolean {
  const user = getStoredUser();

  if (!user) {
    return false;
  }

  return user.roles.includes(roleName);
}

function mapAuthError(error: unknown): Error {
  if (error instanceof AxiosError) {
    const responseMessage =
      typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : null;

    if (responseMessage) {
      return new Error(responseMessage);
    }

    if (error.response?.status === 401) {
      return new Error("Email ou senha inválidos.");
    }

    if (error.response?.status === 422) {
      return new Error("Verifique os dados informados e tente novamente.");
    }

    if (error.code === "ERR_NETWORK") {
      return new Error("Não foi possível conectar à API.");
    }
  }

  return new Error("Não foi possível realizar o login.");
}
