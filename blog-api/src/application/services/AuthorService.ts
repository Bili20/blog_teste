import bcrypt from "bcryptjs";
import { Author } from "@/domain/entities/Author";
import {
  IAuthorRepository,
  CreateAuthorRepositoryData,
  UpdateAuthorData,
} from "@/domain/interfaces/repositories/IAuthorRepository";
import {
  IAuthorService,
  CreateAuthorInput,
} from "@/domain/interfaces/services/IAuthorService";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/shared/errors/AppError";
import { prisma } from "@/infrastructure/database/prisma";
import { ROLE_ADMIN, ROLE_AUTHOR } from "@/shared/constants/roles.constants";

const BCRYPT_SALT_ROUNDS = 10;

export class AuthorService implements IAuthorService {
  constructor(private readonly authorRepository: IAuthorRepository) {}

  async listAuthors(): Promise<Author[]> {
    return this.authorRepository.findAll();
  }

  async getAuthor(id: string): Promise<Author> {
    const author = await this.authorRepository.findById(id);

    if (!author) {
      throw new NotFoundError("Author");
    }

    return author;
  }

  async createAuthor(data: CreateAuthorInput): Promise<Author> {
    await this.ensureAdminAccess();

    const existingAuthors = await this.authorRepository.findAll();
    const emailAlreadyExists = existingAuthors.some(
      (existingAuthor) => existingAuthor.email === data.email,
    );

    if (emailAlreadyExists) {
      throw new ConflictError(
        `An author with email "${data.email}" already exists`,
      );
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

    const repositoryData: CreateAuthorRepositoryData = {
      name: data.name,
      initials: data.initials,
      bio: data.bio,
      email: data.email,
      passwordHash,
    };

    const authorRole = await prisma.role.findUnique({
      where: { name: ROLE_AUTHOR },
      select: { id: true },
    });

    if (!authorRole) {
      throw new ForbiddenError("Author role not available");
    }

    const createdAuthor = await this.authorRepository.create(repositoryData);

    await prisma.authorRole.create({
      data: {
        authorId: createdAuthor.id,
        roleId: authorRole.id,
      },
    });

    return createdAuthor;
  }

  async updateAuthor(id: string, data: UpdateAuthorData): Promise<Author> {
    await this.ensureAdminAccess();
    await this.getAuthor(id);

    return this.authorRepository.update(id, data);
  }

  async deleteAuthor(id: string): Promise<void> {
    await this.ensureAdminAccess();
    await this.getAuthor(id);

    await this.authorRepository.delete(id);
  }

  private async ensureAdminAccess(): Promise<void> {
    const adminRole = await prisma.role.findUnique({
      where: { name: ROLE_ADMIN },
      select: { id: true },
    });

    if (!adminRole) {
      throw new ForbiddenError("Admin role not available");
    }
  }
}
