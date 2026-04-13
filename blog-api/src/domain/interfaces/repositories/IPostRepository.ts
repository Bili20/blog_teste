import { Post, PostSummary } from "@/domain/entities/Post";

export interface FindAllPostsOptions {
  category?: string;
  tagSlug?: string;
  search?: string;
  published?: boolean;
  authorId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPostRepository {
  findAll(options?: FindAllPostsOptions): Promise<PaginatedResult<PostSummary>>;
  findById(id: string): Promise<Post | null>;
  findBySlug(slug: string): Promise<Post | null>;
  findFeatured(): Promise<PostSummary | null>;
  create(data: CreatePostData): Promise<Post>;
  update(id: string, data: UpdatePostData): Promise<Post>;
  delete(id: string): Promise<void>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
}

export interface CreatePostData {
  slug?: string;
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
  category: string;
  readTime: string;
  featured?: boolean;
  published?: boolean;
  authorId: string;
  tagSlugs?: string[];
}

export interface UpdatePostData {
  slug?: string;
  title?: string;
  subtitle?: string;
  excerpt?: string;
  body?: string;
  category?: string;
  readTime?: string;
  featured?: boolean;
  published?: boolean;
  authorId?: string;
  tagSlugs?: string[];
}
