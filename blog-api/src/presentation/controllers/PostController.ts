import { Request, Response } from "express";
import { IPostService } from "@/domain/interfaces/services/IPostService";
import {
  createPostSchema,
  updatePostSchema,
  listPostsQuerySchema,
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
    const post = await this.postService.createPost(data);
    res.status(201).json(post);
  };

  updatePost = async (req: Request, res: Response): Promise<void> => {
    const data = updatePostSchema.parse(req.body);
    const post = await this.postService.updatePost(req.params.id, data);
    res.json(post);
  };

  deletePost = async (req: Request, res: Response): Promise<void> => {
    await this.postService.deletePost(req.params.id);
    res.status(204).send();
  };
}
