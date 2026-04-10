import { PrismaClient } from "@prisma/client";
import { Tag } from "@/domain/entities/Tag";
import {
  ITagRepository,
  CreateTagData,
} from "@/domain/interfaces/repositories/ITagRepository";

export class PrismaTagRepository implements ITagRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Tag[]> {
    return this.prisma.tag.findMany({ orderBy: { name: "asc" } });
  }

  async findById(id: string): Promise<Tag | null> {
    return this.prisma.tag.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    return this.prisma.tag.findUnique({ where: { slug } });
  }

  async create(data: CreateTagData): Promise<Tag> {
    return this.prisma.tag.create({ data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tag.delete({ where: { id } });
  }
}
