import { Request, Response } from "express";
import { serialize } from "cookie";
import { IAuthService } from "@/domain/interfaces/services/IAuthService";
import { loginSchema, refreshTokenSchema } from "@/shared/utils/schemas";
import { UnauthorizedError } from "@/shared/errors/AppError";

const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

function getRefreshTokenCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  const refreshTokenExpiresInDays = Number(
    process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? "30",
  );

  const safeExpiresInDays =
    Number.isFinite(refreshTokenExpiresInDays) && refreshTokenExpiresInDays > 0
      ? refreshTokenExpiresInDays
      : 30;

  const maxAge = safeExpiresInDays * 24 * 60 * 60;

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict" as const,
    path: "/api/auth",
    maxAge,
  };
}

function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.setHeader(
    "Set-Cookie",
    serialize(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      ...getRefreshTokenCookieOptions(),
    }),
  );
}

function clearRefreshTokenCookie(res: Response): void {
  res.setHeader(
    "Set-Cookie",
    serialize(REFRESH_TOKEN_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
      maxAge: 0,
    }),
  );
}

function getRefreshTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.cookie;

  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((cookiePart) => {
        const [rawName, ...rawValueParts] = cookiePart.trim().split("=");
        return [rawName, decodeURIComponent(rawValueParts.join("="))];
      }),
    );

    const cookieRefreshToken = cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (cookieRefreshToken) {
      return cookieRefreshToken;
    }
  }

  const parsedBody = refreshTokenSchema.safeParse(req.body);

  if (parsedBody.success) {
    return parsedBody.data.refreshToken;
  }

  return null;
}

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = loginSchema.parse(req.body);
    const result = await this.authService.login(email, password);

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({
      accessToken: result.accessToken,
    });
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is required");
    }

    const result = await this.authService.refreshToken(refreshToken);

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({
      accessToken: result.accessToken,
    });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

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
