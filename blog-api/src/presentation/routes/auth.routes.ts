import { Router } from "express";
import { AuthController } from "@/presentation/controllers/AuthController";
import { authenticate } from "@/presentation/decorators/authenticate.decorator";

export function authRoutes(controller: AuthController): Router {
  const router = Router();

  // POST /auth/login
  router.post("/login", controller.login);

  // POST /auth/refresh
  router.post("/refresh", controller.refreshToken);

  // POST /auth/logout
  router.post("/logout", controller.logout);

  // GET /auth/me
  router.get("/me", authenticate, controller.getCurrentUser);

  return router;
}
