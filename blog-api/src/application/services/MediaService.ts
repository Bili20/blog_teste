import path from "node:path";
import fs from "node:fs";
import { Media } from "@/domain/entities/Media";
import {
  IMediaRepository,
  CreateMediaData,
} from "@/domain/interfaces/repositories/IMediaRepository";
import { IMediaService } from "@/domain/interfaces/services/IMediaService";
import { NotFoundError } from "@/shared/errors/AppError";

export class MediaService implements IMediaService {
  constructor(private readonly mediaRepository: IMediaRepository) {}

  async createMedia(data: CreateMediaData): Promise<Media> {
    return this.mediaRepository.create(data);
  }

  async getMedia(id: string): Promise<Media> {
    const media = await this.mediaRepository.findById(id);
    if (!media) throw new NotFoundError("Media");
    return media;
  }

  async deleteMedia(id: string): Promise<void> {
    const media = await this.getMedia(id);
    await this.mediaRepository.delete(id);
    this.removeFileFromDisk(media.filename);
  }

  async deleteMediaByPostId(postId: string): Promise<void> {
    const mediaList = await this.mediaRepository.findByPostId(postId);

    for (const media of mediaList) {
      this.removeFileFromDisk(media.filename);
    }
    await this.mediaRepository.deleteByPostId(postId);
  }

  async associateMediaWithPost(
    postId: string,
    bodyHtml: string,
  ): Promise<void> {
    // Find current media associated with this post BEFORE clearing
    const previousMedia = await this.mediaRepository.findByPostId(postId);

    // Clear existing associations
    await this.mediaRepository.clearPostId(postId);

    // Extract filenames from image URLs in the HTML
    const filenames: string[] = [];
    const regex = /\/uploads\/([^"'\s)]+)/g;
    let match;
    while ((match = regex.exec(bodyHtml)) !== null) {
      filenames.push(match[1]);
    }

    if (filenames.length > 0) {
      await this.mediaRepository.updateManyPostId(filenames, postId);
    }

    // Clean up orphaned media — files that were previously associated with
    // this post but are no longer referenced in the body.
    const currentFilenameSet = new Set(filenames);
    for (const media of previousMedia) {
      if (!currentFilenameSet.has(media.filename)) {
        console.log(
          `🧹 Cleaning up orphaned media: ${media.filename} (was in post ${postId})`,
        );
        this.removeFileFromDisk(media.filename);
        await this.mediaRepository.delete(media.id);
      }
    }
  }

  private removeFileFromDisk(filename: string): void {
    const filePath = path.join(process.cwd(), "uploads", filename);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.warn(`⚠️  File not found (already deleted?): ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete file: ${filePath}`, error);
    }
  }
}
