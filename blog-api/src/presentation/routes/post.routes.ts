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

  router.get("/", controller.listPosts);

  router.get("/featured", controller.getFeaturedPost);

  router.get("/slug/:slug", controller.getPostBySlug);

  router.get(
    "/manage",
    authenticate,
    requireRole(ROLE_ADMIN, ROLE_AUTHOR),
    controller.listManagedPosts,
  );

  router.get("/:id", controller.getPostById);

  router.post(
    "/",
    authenticate,
    requireRole(ROLE_ADMIN, ROLE_AUTHOR),
    controller.createPost,
  );

  router.patch(
    "/:id",
    authenticate,
    requireRole(ROLE_ADMIN, ROLE_AUTHOR),
    requirePostOwnership(postService),
    controller.updatePost,
  );

  router.delete(
    "/:id",
    authenticate,
    requireRole("admin", "author"),
    requirePostOwnership(postService),
    controller.deletePost,
  );

  return router;
}
