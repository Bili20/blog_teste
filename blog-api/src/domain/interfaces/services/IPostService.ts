import { Post, PostSummary } from "@/domain/entities/Post";
import {
  FindAllPostsOptions,
  PaginatedResult,
  CreatePostData,
  UpdatePostData,
} from "@/domain/interfaces/repositories/IPostRepository";

export interface ProtectedPostManagementOptions extends FindAllPostsOptions {
  currentAuthorId: string;
  currentRoles: string[];
}

export interface IPostService {
  listPosts(
    options?: FindAllPostsOptions,
  ): Promise<PaginatedResult<PostSummary>>;
  listManagedPosts(
    options: ProtectedPostManagementOptions,
  ): Promise<PaginatedResult<PostSummary>>;
  getPost(id: string): Promise<Post>;
  getPostBySlug(slug: string): Promise<Post>;
  getFeaturedPost(): Promise<PostSummary>;
  createPost(data: CreatePostData): Promise<Post>;
  updatePost(id: string, data: UpdatePostData): Promise<Post>;
  deletePost(id: string): Promise<void>;
}
