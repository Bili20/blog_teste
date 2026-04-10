import { Router } from "express";
import { AuthorController } from "@/presentation/controllers/AuthorController";

export function authorRoutes(controller: AuthorController): Router {
  const router = Router();

  router.get("/", controller.listAuthors);
  router.get("/:id", controller.getAuthor);
  router.post("/", controller.createAuthor);
  router.patch("/:id", controller.updateAuthor);
  router.delete("/:id", controller.deleteAuthor);

  return router;
}
