import { PrismaClient } from "@prisma/client";
import { Author } from "@/domain/entities/Author";
import {
  IAuthorRepository,
  CreateAuthorRepositoryData,
  UpdateAuthorData,
} from "@/domain/interfaces/repositories/IAuthorRepository";

export class PrismaAuthorRepository implements IAuthorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Author[]> {
    return this.prisma.author.findMany({
      orderBy: { name: "asc" },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Author | null> {
    return this.prisma.author.findUnique({ where: { id } });
  }

  async create(data: CreateAuthorRepositoryData): Promise<Author> {
    return this.prisma.author.create({ data });
  }

  async update(id: string, data: UpdateAuthorData): Promise<Author> {
    return this.prisma.author.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.author.delete({ where: { id } });
  }
}
