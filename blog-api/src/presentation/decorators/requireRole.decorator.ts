import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "@/shared/errors/AppError";

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const hasRole = req.user.roles.some((role) =>
      allowedRoles.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenError(
        `Access restricted to roles: ${allowedRoles.join(", ")}`,
      );
    }

    next();
  };
}
