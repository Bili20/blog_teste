import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "@/shared/errors/AppError";
import { JwtPayload } from "@/domain/entities/Auth";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  AUTH_ERROR_MESSAGES,
  JWT_SECRET_ENV_KEY,
} from "@/shared/constants/auth.constants";

function getAccessTokenFromRequest(req: Request): string | null {
  const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];

  if (!cookieToken) {
    return null;
  }

  return cookieToken;
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = getAccessTokenFromRequest(req);
  const secret = process.env[JWT_SECRET_ENV_KEY];

  if (!token) {
    throw new UnauthorizedError(
      AUTH_ERROR_MESSAGES.ACCESS_TOKEN_COOKIE_REQUIRED,
    );
  }

  if (!secret) {
    throw new Error(
      `${JWT_SECRET_ENV_KEY} environment variable is not configured`,
    );
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError(
      AUTH_ERROR_MESSAGES.INVALID_OR_EXPIRED_ACCESS_TOKEN,
    );
  }
}
