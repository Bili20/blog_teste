import { AxiosError } from "axios";
import { api } from "@/services/api";
import type { Tag } from "@/types/tag";

export interface CreateTagRequest {
  name: string;
  slug?: string;
}

export async function listTags(): Promise<Tag[]> {
  try {
    const response = await api.get<Tag[]>("/tags");
    return response.data;
  } catch (error) {
    throw mapTagError(error);
  }
}

export async function getTagById(id: string): Promise<Tag> {
  try {
    const response = await api.get<Tag>(`/tags/${id}`);
    return response.data;
  } catch (error) {
    throw mapTagError(error);
  }
}

export async function createTag(data: CreateTagRequest): Promise<Tag> {
  try {
    const response = await api.post<Tag>("/tags", sanitizeTagPayload(data));
    return response.data;
  } catch (error) {
    throw mapTagError(error);
  }
}

export async function deleteTag(id: string): Promise<void> {
  try {
    await api.delete(`/tags/${id}`);
  } catch (error) {
    throw mapTagError(error);
  }
}

function sanitizeTagPayload(payload: CreateTagRequest): CreateTagRequest {
  const normalizedName = payload.name.trim();
  const normalizedSlug = payload.slug?.trim();

  return {
    name: normalizedName,
    slug: normalizedSlug ? normalizedSlug : undefined,
  };
}

function mapTagError(error: unknown): Error {
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
      return new Error("Tag not found.");
    }

    if (error.response?.status === 409) {
      return new Error("A tag with this slug already exists.");
    }

    if (error.response?.status === 422) {
      return new Error("Please review the tag fields and try again.");
    }

    if (error.code === "ERR_NETWORK") {
      return new Error("Unable to connect to the API.");
    }
  }

  return new Error("Unable to process tags right now.");
}
