import { Router } from "express";
import { AuthorController } from "@/presentation/controllers/AuthorController";
import { authenticate } from "@/presentation/decorators/authenticate.decorator";
import { requireRole } from "@/presentation/decorators/requireRole.decorator";
import { ROLE_ADMIN } from "@/shared/constants/roles.constants";

export function authorRoutes(controller: AuthorController): Router {
  const router = Router();

  router.get("/", controller.listAuthors);
  router.get("/:id", controller.getAuthor);
  router.post(
    "/",
    authenticate,
    requireRole(ROLE_ADMIN),
    controller.createAuthor,
  );
  router.patch(
    "/:id",
    authenticate,
    requireRole(ROLE_ADMIN),
    controller.updateAuthor,
  );
  router.delete(
    "/:id",
    authenticate,
    requireRole(ROLE_ADMIN),
    controller.deleteAuthor,
  );

  return router;
}
