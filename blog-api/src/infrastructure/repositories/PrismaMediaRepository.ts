import { PrismaClient } from "@prisma/client";
import { Media } from "@/domain/entities/Media";
import {
  IMediaRepository,
  CreateMediaData,
} from "@/domain/interfaces/repositories/IMediaRepository";

export class PrismaMediaRepository implements IMediaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateMediaData): Promise<Media> {
    return this.prisma.media.create({ data });
  }

  async findById(id: string): Promise<Media | null> {
    return this.prisma.media.findUnique({ where: { id } });
  }

  async findByFilename(filename: string): Promise<Media | null> {
    return this.prisma.media.findUnique({ where: { filename } });
  }

  async findByPostId(postId: string): Promise<Media[]> {
    return this.prisma.media.findMany({ where: { postId } });
  }

  async findByFilenames(filenames: string[]): Promise<Media[]> {
    return this.prisma.media.findMany({
      where: { filename: { in: filenames } },
    });
  }

  async updatePostId(id: string, postId: string | null): Promise<void> {
    await this.prisma.media.update({
      where: { id },
      data: { postId },
    });
  }

  async updateManyPostId(
    filenames: string[],
    postId: string | null,
  ): Promise<void> {
    await this.prisma.media.updateMany({
      where: { filename: { in: filenames } },
      data: { postId },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.media.delete({ where: { id } });
  }

  async deleteByPostId(postId: string): Promise<void> {
    await this.prisma.media.deleteMany({ where: { postId } });
  }

  async clearPostId(postId: string): Promise<void> {
    await this.prisma.media.updateMany({
      where: { postId },
      data: { postId: null },
    });
  }
}
