import { Router } from "express";
import { TagController } from "@/presentation/controllers/TagController";

export function tagRoutes(controller: TagController): Router {
  const router = Router();

  router.get("/", controller.listTags);
  router.get("/:id", controller.getTag);
  router.post("/", controller.createTag);
  router.delete("/:id", controller.deleteTag);

  return router;
}
