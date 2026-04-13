import { Router } from "express";
import { AuthorController } from "@/presentation/controllers/AuthorController";
import { authenticate } from "@/presentation/decorators/authenticate.decorator";
import { requireRole } from "@/presentation/decorators/requireRole.decorator";

export function authorRoutes(controller: AuthorController): Router {
  const router = Router();

  router.get("/", controller.listAuthors);
  router.get("/:id", controller.getAuthor);
  router.post("/", authenticate, requireRole("admin"), controller.createAuthor);
  router.patch(
    "/:id",
    authenticate,
    requireRole("admin"),
    controller.updateAuthor,
  );
  router.delete(
    "/:id",
    authenticate,
    requireRole("admin"),
    controller.deleteAuthor,
  );

  return router;
}
