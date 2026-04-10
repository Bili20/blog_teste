import { Router } from "express";
import { PostController } from "@/presentation/controllers/PostController";

export function postRoutes(controller: PostController): Router {
  const router = Router();

  // GET /posts?category=Essay&tag=culture&search=internet&page=1&limit=10
  router.get("/", controller.listPosts);

  // GET /posts/featured
  router.get("/featured", controller.getFeaturedPost);

  // GET /posts/slug/:slug
  router.get("/slug/:slug", controller.getPostBySlug);

  // GET /posts/:id
  router.get("/:id", controller.getPostById);

  // POST /posts
  router.post("/", controller.createPost);

  // PATCH /posts/:id
  router.patch("/:id", controller.updatePost);

  // DELETE /posts/:id
  router.delete("/:id", controller.deletePost);

  return router;
}
