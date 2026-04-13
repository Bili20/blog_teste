import { Request, Response } from "express";
import { IPostService } from "@/domain/interfaces/services/IPostService";
import {
  createPostSchema,
  updatePostSchema,
  listPostsQuerySchema,
  listManagedPostsQuerySchema,
} from "@/shared/utils/schemas";

export class PostController {
  constructor(private readonly postService: IPostService) {}

  listPosts = async (req: Request, res: Response): Promise<void> => {
    const query = listPostsQuerySchema.parse(req.query);

    const result = await this.postService.listPosts({
      category: query.category,
      tagSlug: query.tag,
      search: query.search,
      published: query.published,
      page: query.page,
      limit: query.limit,
    });

    res.json(result);
  };

  listManagedPosts = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new Error("Authenticated user context is required");
    }

    const query = listManagedPostsQuerySchema.parse(req.query);

    const result = await this.postService.listManagedPosts({
      currentAuthorId: req.user.sub,
      currentRoles: req.user.roles,
      category: query.category,
      tagSlug: query.tag,
      search: query.search,
      published: query.published,
      page: query.page,
      limit: query.limit,
    });

    res.json(result);
  };

  getFeaturedPost = async (_req: Request, res: Response): Promise<void> => {
    const post = await this.postService.getFeaturedPost();
    res.json(post);
  };

  getPostById = async (req: Request, res: Response): Promise<void> => {
    const post = await this.postService.getPost(req.params.id);
    res.json(post);
  };

  getPostBySlug = async (req: Request, res: Response): Promise<void> => {
    const post = await this.postService.getPostBySlug(req.params.slug);
    res.json(post);
  };

  createPost = async (req: Request, res: Response): Promise<void> => {
    const data = createPostSchema.parse(req.body);

    // Non-admin authors can only create posts attributed to themselves
    // and cannot mark them as featured.
    // Admins may provide any authorId from the request body.
    if (req.user && !req.user.roles.includes("admin")) {
      data.authorId = req.user.sub;
      data.featured = false;
    }

    const post = await this.postService.createPost(data);
    res.status(201).json(post);
  };

  updatePost = async (req: Request, res: Response): Promise<void> => {
    const data = updatePostSchema.parse(req.body);

    // Non-admin authors cannot transfer post ownership to another author
    // and cannot mark posts as featured.
    if (req.user && !req.user.roles.includes("admin")) {
      if (data.authorId) {
        data.authorId = req.user.sub;
      }

      if (data.featured !== undefined) {
        data.featured = false;
      }
    }

    const post = await this.postService.updatePost(req.params.id, data);
    res.json(post);
  };

  deletePost = async (req: Request, res: Response): Promise<void> => {
    await this.postService.deletePost(req.params.id);
    res.status(204).send();
  };
}
