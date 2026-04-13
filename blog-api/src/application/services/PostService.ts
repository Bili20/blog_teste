import slugify from "slugify";
import { Post, PostSummary } from "@/domain/entities/Post";
import {
  IPostRepository,
  FindAllPostsOptions,
  PaginatedResult,
  CreatePostData,
  UpdatePostData,
} from "@/domain/interfaces/repositories/IPostRepository";
import {
  IPostService,
  ProtectedPostManagementOptions,
} from "@/domain/interfaces/services/IPostService";
import { NotFoundError, ConflictError } from "@/shared/errors/AppError";

export class PostService implements IPostService {
  constructor(private readonly postRepository: IPostRepository) {}

  async listPosts(
    options?: FindAllPostsOptions,
  ): Promise<PaginatedResult<PostSummary>> {
    return this.postRepository.findAll(options);
  }

  async listManagedPosts(
    options: ProtectedPostManagementOptions,
  ): Promise<PaginatedResult<PostSummary>> {
    const { currentAuthorId, currentRoles, ...filters } = options;
    const isAdmin = currentRoles.includes("admin");

    return this.postRepository.findAll({
      ...filters,
      authorId: isAdmin ? undefined : currentAuthorId,
    });
  }

  async getPost(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) throw new NotFoundError("Post");
    return post;
  }

  async getPostBySlug(slug: string): Promise<Post> {
    const post = await this.postRepository.findBySlug(slug);
    if (!post) throw new NotFoundError("Post");
    return post;
  }

  async getFeaturedPost(): Promise<PostSummary> {
    const post = await this.postRepository.findFeatured();
    if (!post) throw new NotFoundError("Featured post");
    return post;
  }

  async createPost(data: CreatePostData): Promise<Post> {
    const slug =
      data.slug ||
      slugify(data.title, { lower: true, strict: true, trim: true });

    const slugExists = await this.postRepository.existsBySlug(slug);
    if (slugExists) {
      throw new ConflictError(`A post with slug "${slug}" already exists`);
    }

    return this.postRepository.create({ ...data, slug });
  }

  async updatePost(id: string, data: UpdatePostData): Promise<Post> {
    // Ensure the post exists
    await this.getPost(id);

    if (data.slug) {
      const slugExists = await this.postRepository.existsBySlug(data.slug, id);
      if (slugExists) {
        throw new ConflictError(
          `A post with slug "${data.slug}" already exists`,
        );
      }
    } else if (data.title) {
      // Auto-regenerate slug when title changes (only if slug not explicitly provided)
      data.slug = slugify(data.title, {
        lower: true,
        strict: true,
        trim: true,
      });
      const slugExists = await this.postRepository.existsBySlug(data.slug, id);
      if (slugExists) {
        // Don't throw — just keep the old slug
        delete data.slug;
      }
    }

    return this.postRepository.update(id, data);
  }

  async deletePost(id: string): Promise<void> {
    await this.getPost(id);
    await this.postRepository.delete(id);
  }
}
