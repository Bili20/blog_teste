import { Router } from "express";
import { PostController } from "@/presentation/controllers/PostController";
import { authenticate } from "@/presentation/decorators/authenticate.decorator";
import { requireRole } from "@/presentation/decorators/requireRole.decorator";

export function postRoutes(controller: PostController): Router {
  const router = Router();

  // ── Public routes ───────────────────────────────────────────────────────────

  // GET /posts?category=Essay&tag=culture&search=internet&page=1&limit=10
  router.get("/", controller.listPosts);

  // GET /posts/featured
  router.get("/featured", controller.getFeaturedPost);

  // GET /posts/slug/:slug
  router.get("/slug/:slug", controller.getPostBySlug);

  // GET /posts/:id
  router.get("/:id", controller.getPostById);

  // ── Protected routes — require valid JWT + admin role ───────────────────────

  // POST /posts
  router.post("/", authenticate, requireRole("admin"), controller.createPost);

  // PATCH /posts/:id
  router.patch(
    "/:id",
    authenticate,
    requireRole("admin"),
    controller.updatePost,
  );

  // DELETE /posts/:id
  router.delete(
    "/:id",
    authenticate,
    requireRole("admin"),
    controller.deletePost,
  );

  return router;
}
