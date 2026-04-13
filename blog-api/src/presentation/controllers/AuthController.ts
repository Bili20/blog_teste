import { Request, Response } from "express";
import { serialize } from "cookie";
import { IAuthService } from "@/domain/interfaces/services/IAuthService";
import { loginSchema } from "@/shared/utils/schemas";
import { UnauthorizedError } from "@/shared/errors/AppError";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  AUTH_COOKIE_PATHS,
  AUTH_ENV_KEYS,
  AUTH_ERROR_MESSAGES,
  AUTH_TOKEN_DEFAULTS,
  REFRESH_TOKEN_COOKIE_NAME,
  isProductionEnvironment,
} from "@/shared/constants/auth.constants";

function getAccessTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: isProductionEnvironment(),
    sameSite: AUTH_TOKEN_DEFAULTS.COOKIE_SAME_SITE,
    path: AUTH_COOKIE_PATHS.ACCESS_TOKEN,
  };
}

function getRefreshTokenCookieOptions() {
  const refreshTokenExpiresInDays = Number(
    process.env[AUTH_ENV_KEYS.REFRESH_TOKEN_EXPIRES_IN_DAYS] ??
      String(AUTH_TOKEN_DEFAULTS.REFRESH_TOKEN_EXPIRES_IN_DAYS),
  );

  const safeExpiresInDays =
    Number.isFinite(refreshTokenExpiresInDays) && refreshTokenExpiresInDays > 0
      ? refreshTokenExpiresInDays
      : AUTH_TOKEN_DEFAULTS.REFRESH_TOKEN_EXPIRES_IN_DAYS;

  const maxAge = safeExpiresInDays * 24 * 60 * 60;

  return {
    httpOnly: true,
    secure: isProductionEnvironment(),
    sameSite: AUTH_TOKEN_DEFAULTS.COOKIE_SAME_SITE,
    path: AUTH_COOKIE_PATHS.REFRESH_TOKEN,
    maxAge,
  };
}

function setAccessTokenCookie(res: Response, accessToken: string): void {
  res.append(
    "Set-Cookie",
    serialize(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      ...getAccessTokenCookieOptions(),
    }),
  );
}

function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.append(
    "Set-Cookie",
    serialize(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      ...getRefreshTokenCookieOptions(),
    }),
  );
}

function clearAccessTokenCookie(res: Response): void {
  res.append(
    "Set-Cookie",
    serialize(ACCESS_TOKEN_COOKIE_NAME, "", {
      httpOnly: true,
      secure: isProductionEnvironment(),
      sameSite: AUTH_TOKEN_DEFAULTS.COOKIE_SAME_SITE,
      path: AUTH_COOKIE_PATHS.ACCESS_TOKEN,
      maxAge: 0,
    }),
  );
}

function clearRefreshTokenCookie(res: Response): void {
  res.append(
    "Set-Cookie",
    serialize(REFRESH_TOKEN_COOKIE_NAME, "", {
      httpOnly: true,
      secure: isProductionEnvironment(),
      sameSite: AUTH_TOKEN_DEFAULTS.COOKIE_SAME_SITE,
      path: AUTH_COOKIE_PATHS.REFRESH_TOKEN,
      maxAge: 0,
    }),
  );
}

function getRefreshTokenFromRequest(req: Request): string | null {
  const cookieRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  if (cookieRefreshToken) {
    return cookieRefreshToken;
  }

  return null;
}

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = loginSchema.parse(req.body);
    const result = await this.authService.login(email, password);

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({});
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      throw new UnauthorizedError(AUTH_ERROR_MESSAGES.REFRESH_TOKEN_REQUIRED);
    }

    const result = await this.authService.refreshToken(refreshToken);

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({});
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    clearAccessTokenCookie(res);
    clearRefreshTokenCookie(res);

    res.status(204).send();
  };

  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.sub) {
      throw new UnauthorizedError("Authentication required");
    }

    const currentUser = await this.authService.getCurrentUser(req.user.sub);

    res.status(200).json(currentUser);
  };
}
