import { AxiosError } from "axios";
import { api } from "@/services/api";
import type {
  CreatePostRequest,
  ListPostsParams,
  Post,
  PostCategory,
  PostSummary,
  UpdatePostRequest,
} from "@/types/post";

interface ApiPostAuthor {
  id: string;
  name: string;
  initials: string;
  bio: string | null;
}

interface ApiPostTag {
  id: string;
  name: string;
  slug: string;
}

interface ApiPostSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: string;
  readTime: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: ApiPostAuthor;
  tags: ApiPostTag[];
}

interface ApiPost extends ApiPostSummary {
  body: string;
}

interface ApiPaginatedPostsResponse {
  data: ApiPostSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const VALID_POST_CATEGORIES: PostCategory[] = [
  "Essay",
  "Practice",
  "Work",
  "Tools",
];

export async function listPosts(
  params: ListPostsParams = {},
): Promise<{
  data: PostSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  try {
    const response = await api.get<ApiPaginatedPostsResponse>("/posts", {
      params,
    });

    return {
      ...response.data,
      data: response.data.data.map(normalizePostSummary),
    };
  } catch (error) {
    throw mapPostError(error);
  }
}

export async function getFeaturedPost(): Promise<PostSummary> {
  try {
    const response = await api.get<ApiPostSummary>("/posts/featured");
    return normalizePostSummary(response.data);
  } catch (error) {
    throw mapPostError(error);
  }
}

export async function getPostBySlug(slug: string): Promise<Post> {
  try {
    const response = await api.get<ApiPost>(`/posts/slug/${slug}`);
    return normalizePost(response.data);
  } catch (error) {
    throw mapPostError(error);
  }
}

export async function getPostById(id: string): Promise<Post> {
  try {
    const response = await api.get<ApiPost>(`/posts/${id}`);
    return normalizePost(response.data);
  } catch (error) {
    throw mapPostError(error);
  }
}

export async function createPost(data: CreatePostRequest): Promise<Post> {
  try {
    const response = await api.post<ApiPost>(
      "/posts",
      sanitizePostPayload(data),
    );
    return normalizePost(response.data);
  } catch (error) {
    throw mapPostError(error);
  }
}

export async function updatePost(
  id: string,
  data: UpdatePostRequest,
): Promise<Post> {
  try {
    const response = await api.patch<ApiPost>(
      `/posts/${id}`,
      sanitizePostPayload(data),
    );
    return normalizePost(response.data);
  } catch (error) {
    throw mapPostError(error);
  }
}

export async function deletePost(id: string): Promise<void> {
  try {
    await api.delete(`/posts/${id}`);
  } catch (error) {
    throw mapPostError(error);
  }
}

function sanitizePostPayload<T extends CreatePostRequest | UpdatePostRequest>(
  payload: T,
): T {
  const sanitizedPayload = { ...payload };

  if ("slug" in sanitizedPayload && sanitizedPayload.slug !== undefined) {
    const normalizedSlug = sanitizedPayload.slug.trim();
    sanitizedPayload.slug = normalizedSlug === "" ? undefined : normalizedSlug;
  }

  if (
    "tagSlugs" in sanitizedPayload &&
    sanitizedPayload.tagSlugs !== undefined
  ) {
    sanitizedPayload.tagSlugs = sanitizedPayload.tagSlugs
      .map((tagSlug) => tagSlug.trim())
      .filter(Boolean);
  }

  return sanitizedPayload;
}

function normalizePostSummary(apiPost: ApiPostSummary): PostSummary {
  return {
    ...apiPost,
    category: normalizeCategory(apiPost.category),
    date: formatPostDate(apiPost.createdAt),
  };
}

function normalizePost(apiPost: ApiPost): Post {
  return {
    ...apiPost,
    category: normalizeCategory(apiPost.category),
    date: formatPostDate(apiPost.createdAt),
  };
}

function normalizeCategory(category: string): PostCategory {
  if (VALID_POST_CATEGORIES.includes(category as PostCategory)) {
    return category as PostCategory;
  }

  return "Essay";
}

function formatPostDate(dateValue: string): string {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function mapPostError(error: unknown): Error {
  if (error instanceof AxiosError) {
    const responseMessage =
      typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : null;

    if (responseMessage) {
      return new Error(responseMessage);
    }

    if (error.response?.status === 401) {
      return new Error("Authentication required.");
    }

    if (error.response?.status === 403) {
      return new Error("You do not have permission to perform this action.");
    }

    if (error.response?.status === 404) {
      return new Error("Post not found.");
    }

    if (error.response?.status === 409) {
      return new Error("A post with this slug already exists.");
    }

    if (error.response?.status === 422) {
      return new Error("Please review the post fields and try again.");
    }

    if (error.code === "ERR_NETWORK") {
      return new Error("Unable to connect to the API.");
    }
  }

  return new Error("Unable to load posts right now.");
}
