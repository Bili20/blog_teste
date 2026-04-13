import { Router } from "express";
import { PostController } from "@/presentation/controllers/PostController";
import { IPostService } from "@/domain/interfaces/services/IPostService";
import { authenticate } from "@/presentation/decorators/authenticate.decorator";
import { requireRole } from "@/presentation/decorators/requireRole.decorator";
import { requirePostOwnership } from "@/presentation/decorators/requirePostOwnership.decorator";
import { ROLE_ADMIN, ROLE_AUTHOR } from "@/shared/constants/roles.constants";

export function postRoutes(
  controller: PostController,
  postService: IPostService,
): Router {
  const router = Router();

  // ── Public routes ───────────────────────────────────────────────────────────

  // GET /posts?category=Essay&tag=culture&search=internet&page=1&limit=10
  router.get("/", controller.listPosts);

  // GET /posts/featured
  router.get("/featured", controller.getFeaturedPost);

  // GET /posts/slug/:slug
  router.get("/slug/:slug", controller.getPostBySlug);

  // ── Protected routes ─────────────────────────────────────────────────────────
  //
  // Both ROLE_ADMIN and ROLE_AUTHOR are allowed to manage posts.
  //
  // Admin:  can list, create, edit and delete any post.
  // Author: can list, create, edit and delete only their own posts.
  //
  // Ownership for update/delete is enforced by requirePostOwnership.
  // Ownership for protected listing is enforced in the backend service layer.

  // GET /posts/manage
  router.get(
    "/manage",
    authenticate,
    requireRole(ROLE_ADMIN, ROLE_AUTHOR),
    controller.listManagedPosts,
  );

  // GET /posts/:id
  router.get("/:id", controller.getPostById);

  // POST /posts
  router.post(
    "/",
    authenticate,
    requireRole(ROLE_ADMIN, ROLE_AUTHOR),
    controller.createPost,
  );

  // PATCH /posts/:id
  router.patch(
    "/:id",
    authenticate,
    requireRole(ROLE_ADMIN, ROLE_AUTHOR),
    requirePostOwnership(postService),
    controller.updatePost,
  );

  // DELETE /posts/:id
  router.delete(
    "/:id",
    authenticate,
    requireRole("admin", "author"),
    requirePostOwnership(postService),
    controller.deletePost,
  );

  return router;
}
