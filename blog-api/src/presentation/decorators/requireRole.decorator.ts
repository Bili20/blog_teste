import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "@/shared/errors/AppError";
import { AUTH_ERROR_MESSAGES } from "@/shared/constants/auth.constants";

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError(
        AUTH_ERROR_MESSAGES.ACCESS_TOKEN_COOKIE_REQUIRED,
      );
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenError(
        `Access restricted to roles: ${allowedRoles.join(", ")}`,
      );
    }

    next();
  };
}
