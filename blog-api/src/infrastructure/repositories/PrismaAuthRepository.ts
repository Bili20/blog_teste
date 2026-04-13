import prisma from "@/infrastructure/database/prisma";
import { AuthorWithCredentials } from "@/domain/entities/Author";
import {
  CreateRefreshTokenData,
  IAuthRepository,
  RefreshTokenRecord,
} from "@/domain/interfaces/repositories/IAuthRepository";

type PrismaClientInstance = typeof prisma;

export class PrismaAuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaClientInstance) {}

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

    return author ? this.mapAuthorWithCredentials(author) : null;
  }

  async findById(id: string): Promise<AuthorWithCredentials | null> {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return author ? this.mapAuthorWithCredentials(author) : null;
  }

  async createRefreshToken(
    data: CreateRefreshTokenData,
  ): Promise<RefreshTokenRecord> {
    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        tokenHash: data.tokenHash,
        authorId: data.authorId,
        expiresAt: data.expiresAt,
      },
    });

    return this.mapRefreshToken(refreshToken);
  }

  async findRefreshTokenByHash(
    tokenHash: string,
  ): Promise<RefreshTokenRecord | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    return refreshToken ? this.mapRefreshToken(refreshToken) : null;
  }

  async revokeRefreshToken(id: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async revokeRefreshTokenByHash(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  private mapAuthorWithCredentials(author: {
    id: string;
    name: string;
    initials: string;
    bio: string | null;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
    roles: Array<{
      role: {
        id: string;
        name: string;
      };
    }>;
  }): AuthorWithCredentials {
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

  private mapRefreshToken(refreshToken: {
    id: string;
    tokenHash: string;
    authorId: string;
    expiresAt: Date;
    createdAt: Date;
    revokedAt: Date | null;
  }): RefreshTokenRecord {
    return {
      id: refreshToken.id,
      tokenHash: refreshToken.tokenHash,
      authorId: refreshToken.authorId,
      expiresAt: refreshToken.expiresAt,
      createdAt: refreshToken.createdAt,
      revokedAt: refreshToken.revokedAt,
    };
  }
}
