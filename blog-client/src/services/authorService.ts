import { AxiosError } from "axios";
import { api } from "@/services/api";

export interface AuthorRole {
  id: string;
  name: string;
}

export interface Author {
  id: string;
  name: string;
  initials: string;
  bio: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
  roles: AuthorRole[];
}

export interface CreateAuthorRequest {
  name: string;
  initials: string;
  bio?: string;
  email: string;
  password: string;
}

export interface UpdateAuthorRequest {
  name?: string;
  initials?: string;
  bio?: string;
}

type AuthorApiResponse = {
  id: string;
  name: string;
  initials: string;
  bio: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
  roles?: Array<{
    role?: {
      id: string;
      name: string;
    };
  }>;
};

export async function listAuthors(): Promise<Author[]> {
  try {
    const response = await api.get<AuthorApiResponse[]>("/authors");
    return response.data.map(normalizeAuthor);
  } catch (error) {
    throw mapAuthorError(error);
  }
}

export async function getAuthorById(id: string): Promise<Author> {
  try {
    const response = await api.get<AuthorApiResponse>(`/authors/${id}`);
    return normalizeAuthor(response.data);
  } catch (error) {
    throw mapAuthorError(error);
  }
}

export async function createAuthor(data: CreateAuthorRequest): Promise<Author> {
  try {
    const response = await api.post<AuthorApiResponse>("/authors", data);
    return normalizeAuthor(response.data);
  } catch (error) {
    throw mapAuthorError(error);
  }
}

export async function updateAuthor(
  id: string,
  data: UpdateAuthorRequest,
): Promise<Author> {
  try {
    const response = await api.patch<AuthorApiResponse>(`/authors/${id}`, data);
    return normalizeAuthor(response.data);
  } catch (error) {
    throw mapAuthorError(error);
  }
}

export async function deleteAuthor(id: string): Promise<void> {
  try {
    await api.delete(`/authors/${id}`);
  } catch (error) {
    throw mapAuthorError(error);
  }
}

function normalizeAuthor(author: AuthorApiResponse): Author {
  return {
    id: author.id,
    name: author.name,
    initials: author.initials,
    bio: author.bio,
    email: author.email,
    createdAt: author.createdAt,
    updatedAt: author.updatedAt,
    roles: Array.isArray(author.roles)
      ? author.roles
          .map((authorRole) => authorRole.role)
          .filter((role): role is AuthorRole => Boolean(role))
      : [],
  };
}

function mapAuthorError(error: unknown): Error {
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
      return new Error("Author not found.");
    }

    if (error.response?.status === 409) {
      return new Error("An author with this email already exists.");
    }

    if (error.response?.status === 422) {
      let message = "";
      if (error.response.data?.issues.length > 0) {
        error.response.data?.issues.map((issue: { message: string }) => {
          message += `- ${issue.message}\n`;
        });
        return new Error(message);
      }
      return new Error("Please review the form fields and try again.");
    }

    if (error.code === "ERR_NETWORK") {
      return new Error("Unable to connect to the API.");
    }
  }

  return new Error("Unable to load authors right now.");
}
