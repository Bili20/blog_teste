import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ── Post ──────────────────────────────────────────────────────────────────────

export const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  subtitle: z.string().min(3).max(300),
  excerpt: z.string().min(10).max(600),
  body: z.string().min(20),
  category: z.enum(["Essay", "Practice", "Work", "Tools"]),
  readTime: z.string().min(1).max(20),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case")
    .optional(),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
  authorId: z.string().min(1, "authorId is required"),
  tagSlugs: z.array(z.string()).optional().default([]),
});

export const updatePostSchema = createPostSchema.partial();

export const listPostsQuerySchema = z.object({
  category: z.enum(["Essay", "Practice", "Work", "Tools"]).optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  published: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .optional(),
});

// ── Author ────────────────────────────────────────────────────────────────────

export const createAuthorSchema = z.object({
  name: z.string().min(2).max(100),
  initials: z
    .string()
    .min(2)
    .max(3)
    .regex(/^[A-Z]+$/, "Initials must be uppercase letters"),
  bio: z.string().max(500).optional(),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateAuthorSchema = createAuthorSchema.partial();

// ── Tag ───────────────────────────────────────────────────────────────────────

export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case")
    .optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
export type CreateAuthorInput = z.infer<typeof createAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
