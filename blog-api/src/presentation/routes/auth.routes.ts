import { Router } from "express";
import { AuthController } from "@/presentation/controllers/AuthController";

export function authRoutes(controller: AuthController): Router {
  const router = Router();

  // POST /auth/login
  router.post("/login", controller.login);

  return router;
}
