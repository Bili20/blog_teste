import { AxiosError } from "axios";
import { api } from "@/services/api";
import type {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
} from "@/types/auth";

const AUTH_USER_STORAGE_KEY = "blog.auth.user";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    await api.post("/auth/login", credentials);
    return;
  } catch (error) {
    throw mapAuthError(error);
  }
}

export async function refreshAccessToken(): Promise<LoginResponse> {
  try {
    await api.post("/auth/refresh", {});
    return;
  } catch (error) {
    throw mapAuthError(error);
  }
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  try {
    const response = await api.get<AuthenticatedUser>("/auth/me");
    persistUser(response.data);
    return response.data;
  } catch (error) {
    throw mapAuthError(error);
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout", {});
  } catch (error) {
    throw mapAuthError(error);
  } finally {
    clearStoredUser();
  }
}

export function persistUser(user: AuthenticatedUser): void {
  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
}

export function getStoredUser(): AuthenticatedUser | null {
  const rawUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthenticatedUser;
  } catch {
    clearStoredUser();
    return null;
  }
}

export function clearStoredUser(): void {
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
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

  return new Error("Não foi possível realizar a autenticação.");
}
