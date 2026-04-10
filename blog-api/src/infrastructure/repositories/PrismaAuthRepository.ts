import { PrismaClient } from "@prisma/client";
import { AuthorWithCredentials } from "@/domain/entities/Author";
import { IAuthRepository } from "@/domain/interfaces/repositories/IAuthRepository";

export class PrismaAuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<AuthorWithCredentials | null> {
    const author = await this.prisma.author.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!author) return null;

    return {
      id: author.id,
      name: author.name,
      initials: author.initials,
      bio: author.bio,
      email: author.email,
      passwordHash: author.passwordHash,
      roles: author.roles.map((authorRole) => authorRole.role.name),
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    };
  }
}
