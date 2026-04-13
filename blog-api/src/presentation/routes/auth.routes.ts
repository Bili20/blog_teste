import { Router } from "express";
import { AuthController } from "@/presentation/controllers/AuthController";
import { authenticate } from "@/presentation/decorators/authenticate.decorator";

export function authRoutes(controller: AuthController): Router {
  const router = Router();

  // POST /auth/login
  router.post("/login", controller.login);

  // GET /auth/me
  router.get("/me", authenticate, controller.getCurrentUser);

  return router;
}
