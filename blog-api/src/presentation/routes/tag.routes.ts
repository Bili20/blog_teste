import { Router } from "express";
import { TagController } from "@/presentation/controllers/TagController";
import { authenticate } from "@/presentation/decorators/authenticate.decorator";
import { requireRole } from "@/presentation/decorators/requireRole.decorator";
import { ROLE_ADMIN } from "@/shared/constants/roles.constants";

export function tagRoutes(controller: TagController): Router {
  const router = Router();

  // ── Public routes ───────────────────────────────────────────────────────────
  router.get("/", controller.listTags);
  router.get("/:id", controller.getTag);

  // ── Protected routes — require valid JWT + admin role ──────────────────────
  router.post("/", authenticate, requireRole(ROLE_ADMIN), controller.createTag);
  router.delete(
    "/:id",
    authenticate,
    requireRole(ROLE_ADMIN),
    controller.deleteTag,
  );

  return router;
}
