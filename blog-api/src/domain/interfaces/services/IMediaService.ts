import { Media } from "@/domain/entities/Media";
import { CreateMediaData } from "@/domain/interfaces/repositories/IMediaRepository";

export interface IMediaService {
  createMedia(data: CreateMediaData): Promise<Media>;
  getMedia(id: string): Promise<Media>;
  deleteMedia(id: string): Promise<void>;
  deleteMediaByPostId(postId: string): Promise<void>;
  associateMediaWithPost(postId: string, bodyHtml: string): Promise<void>;
}
