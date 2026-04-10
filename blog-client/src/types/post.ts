export const POST_CATEGORIES = ["Essay", "Practice", "Work", "Tools"] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export interface PostAuthor {
  id: string;
  name: string;
  initials: string;
  bio: string | null;
}

export interface PostTag {
  id: string;
  name: string;
  slug: string;
}

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: PostCategory;
  date: string;
  readTime: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: PostAuthor;
  tags: PostTag[];
}

export interface Post extends PostSummary {
  body: string;
}

export interface PaginatedPostsResponse {
  data: PostSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListPostsParams {
  category?: PostCategory;
  tag?: string;
  search?: string;
  published?: boolean;
  page?: number;
  limit?: number;
}

export interface PostFormValues {
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
  category: PostCategory;
  readTime: string;
  slug?: string;
  featured: boolean;
  published: boolean;
  authorId: string;
  tagSlugs: string[];
}

export interface CreatePostRequest {
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
  category: PostCategory;
  readTime: string;
  slug?: string;
  featured?: boolean;
  published?: boolean;
  authorId: string;
  tagSlugs?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  subtitle?: string;
  excerpt?: string;
  body?: string;
  category?: PostCategory;
  readTime?: string;
  slug?: string;
  featured?: boolean;
  published?: boolean;
  authorId?: string;
  tagSlugs?: string[];
}
