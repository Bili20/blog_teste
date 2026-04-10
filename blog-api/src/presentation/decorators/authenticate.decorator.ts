import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "@/shared/errors/AppError";
import { JwtPayload } from "@/domain/entities/Auth";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Access token is required");
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not configured");
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}
