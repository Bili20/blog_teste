import { api, API_BASE_URL } from "@/services/api";

export interface UploadResponse {
  url: string;
  width: number;
  height: number;
}

// Derive the server origin from the API base URL by stripping the /api suffix.
// e.g. "http://localhost:3333/api" → "http://localhost:3333"
const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post<UploadResponse>("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    ...response.data,
    url: `${SERVER_ORIGIN}${response.data.url}`,
  };
}
