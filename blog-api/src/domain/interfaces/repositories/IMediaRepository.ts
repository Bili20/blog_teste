import { Media } from "@/domain/entities/Media";

export interface CreateMediaData {
  filename: string;
  url: string;
  mimetype: string;
  width: number | null;
  height: number | null;
  size: number;
}

export interface IMediaRepository {
  create(data: CreateMediaData): Promise<Media>;
  findById(id: string): Promise<Media | null>;
  findByFilename(filename: string): Promise<Media | null>;
  findByPostId(postId: string): Promise<Media[]>;
  findByFilenames(filenames: string[]): Promise<Media[]>;
  updatePostId(id: string, postId: string | null): Promise<void>;
  updateManyPostId(filenames: string[], postId: string | null): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByPostId(postId: string): Promise<void>;
  clearPostId(postId: string): Promise<void>;
}
