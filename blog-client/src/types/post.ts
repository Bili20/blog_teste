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
  category: string;
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
