import { z } from "zod";

import { POST_CATEGORIES } from "@/types/post";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Authors ──────────────────────────────────────────────────────────────────
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100)
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character",
  );

export const createAuthorSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be at most 100 characters."),
  initials: z
    .string()
    .regex(/^[A-Z]{2,3}$/, "Initials must be 2–3 uppercase letters (e.g. MV)."),
  bio: z.string().max(500, "Bio must be at most 500 characters."),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: passwordSchema,
});

export type CreateAuthorFormValues = z.infer<typeof createAuthorSchema>;

export const editAuthorSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be at most 100 characters."),
  initials: z
    .string()
    .regex(/^[A-Z]{2,3}$/, "Initials must be 2–3 uppercase letters (e.g. MV)."),
  bio: z.string().max(500, "Bio must be at most 500 characters."),
});

export type EditAuthorFormValues = z.infer<typeof editAuthorSchema>;

// ─── Tags ─────────────────────────────────────────────────────────────────────

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(50, "Name must be at most 50 characters."),
  slug: z
    .string()
    .refine(
      (val) => val === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val),
      "Slug must be in kebab-case (e.g. my-tag).",
    ),
});

export type CreateTagFormValues = z.infer<typeof createTagSchema>;

// ─── Posts ────────────────────────────────────────────────────────────────────

export const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  subtitle: z.string().min(3, "Subtitle must be at least 3 characters."),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters."),
  body: z.string().min(20, "Body must be at least 20 characters."),
  category: z.enum(POST_CATEGORIES),
  readTime: z.string().min(1, "Read time is required."),
  slug: z
    .string()
    .refine(
      (val) => val === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val),
      "Slug must be in kebab-case (e.g. my-post-title).",
    ),
  featured: z.boolean(),
  published: z.boolean(),
  authorId: z.string(),
  selectedTagSlugs: z.array(z.string()),
});

export type PostSchemaValues = z.infer<typeof postSchema>;
