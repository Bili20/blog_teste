export interface PostTag {
  id: string;
  name: string;
  slug: string;
}

export interface PostAuthor {
  id: string;
  name: string;
  initials: string;
  bio: string | null;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
  category: string;
  readTime: string;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: PostAuthor;
  tags: PostTag[];
}

export type PostSummary = Omit<Post, "body">;
