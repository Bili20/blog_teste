import { Request, Response, NextFunction } from "express";
import { IPostService } from "@/domain/interfaces/services/IPostService";
import { ForbiddenError, UnauthorizedError } from "@/shared/errors/AppError";
import { ROLE_ADMIN } from "@/shared/constants/roles.constants";

/**
 * Ownership guard for post write operations.
 *
 * - `admin` role: skips the ownership check entirely — can manage any post.
 * - `author` role: fetches the target post and verifies that
 *   `post.authorId === req.user.sub`. Throws `403 ForbiddenError` if the
 *   authenticated user does not own the post.
 *
 * Must be placed **after** `authenticate` and `requireRole("admin", "author")`
 * in the middleware chain.
 *
 * @example
 * router.patch(
 *   "/:id",
 *   authenticate,
 *   requireRole("admin", "author"),
 *   requirePostOwnership(postService),
 *   controller.updatePost,
 * );
 */
export function requirePostOwnership(postService: IPostService) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    // Admin can manage any post — no ownership check needed.
    if (req.user.roles.includes(ROLE_ADMIN)) {
      return next();
    }

    // For every other allowed role (i.e. "author"), verify that the
    // authenticated user is the owner of the target post.
    const postId = req.params.id;

    // postService.getPost throws NotFoundError (404) if the post does not
    // exist, which is the correct behaviour before we even reach the ownership
    // check.
    const post = await postService.getPost(postId);

    if (post.authorId !== req.user.sub) {
      throw new ForbiddenError("You can only modify your own posts");
    }

    next();
  };
}
