import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "@/shared/errors/AppError";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(422).json({
      error: "Validation Error",
      issues: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
    return;
  }

  console.error("[Unhandled Error]", err);

  res.status(500).json({
    error: "InternalServerError",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
  });
}
