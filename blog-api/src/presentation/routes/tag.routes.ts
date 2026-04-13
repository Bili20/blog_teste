import { Router } from "express";
import { TagController } from "@/presentation/controllers/TagController";
import { authenticate } from "@/presentation/decorators/authenticate.decorator";
import { requireRole } from "@/presentation/decorators/requireRole.decorator";

export function tagRoutes(controller: TagController): Router {
  const router = Router();

  // ── Public routes ───────────────────────────────────────────────────────────
  router.get("/", controller.listTags);
  router.get("/:id", controller.getTag);

  // ── Protected routes — require valid JWT + admin role ──────────────────────
  router.post("/", authenticate, requireRole("admin"), controller.createTag);
  router.delete(
    "/:id",
    authenticate,
    requireRole("admin"),
    controller.deleteTag,
  );

  return router;
}
