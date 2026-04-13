export const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

export const AUTH_COOKIE_PATHS = {
  ACCESS_TOKEN: "/api",
  REFRESH_TOKEN: "/api/auth",
} as const;

export const AUTH_TOKEN_DEFAULTS = {
  ACCESS_TOKEN_EXPIRES_IN: "7d",
  REFRESH_TOKEN_EXPIRES_IN_DAYS: 30,
  REFRESH_TOKEN_BYTE_LENGTH: 64,
  COOKIE_SAME_SITE: "strict" as const,
} as const;

export const AUTH_ENV_KEYS = {
  JWT_SECRET: "JWT_SECRET",
  JWT_EXPIRES_IN: "JWT_EXPIRES_IN",
  REFRESH_TOKEN_EXPIRES_IN_DAYS: "REFRESH_TOKEN_EXPIRES_IN_DAYS",
  NODE_ENV: "NODE_ENV",
} as const;

export const JWT_SECRET_ENV_KEY = AUTH_ENV_KEYS.JWT_SECRET;

export const AUTH_ERROR_MESSAGES = {
  ACCESS_TOKEN_COOKIE_REQUIRED: "Access token cookie is required",
  INVALID_OR_EXPIRED_ACCESS_TOKEN: "Invalid or expired access token",
  INVALID_CREDENTIALS: "Invalid credentials",
  INVALID_REFRESH_TOKEN: "Invalid refresh token",
  REVOKED_REFRESH_TOKEN: "Refresh token has been revoked",
  EXPIRED_REFRESH_TOKEN: "Refresh token has expired",
  AUTHENTICATED_USER_NOT_FOUND: "Authenticated user not found",
  REFRESH_TOKEN_REQUIRED: "Refresh token is required",
} as const;

export function isProductionEnvironment(): boolean {
  return process.env[AUTH_ENV_KEYS.NODE_ENV] === "production";
}
