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
import { NotFoundError } from "@/shared/errors/AppError";

const BCRYPT_SALT_ROUNDS = 10;

export class AuthorService implements IAuthorService {
  constructor(private readonly authorRepository: IAuthorRepository) {}

  async listAuthors(): Promise<Author[]> {
    return this.authorRepository.findAll();
  }

  async getAuthor(id: string): Promise<Author> {
    const author = await this.authorRepository.findById(id);
    if (!author) throw new NotFoundError("Author");
    return author;
  }

  async createAuthor(data: CreateAuthorInput): Promise<Author> {
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

    const repositoryData: CreateAuthorRepositoryData = {
      name: data.name,
      initials: data.initials,
      bio: data.bio,
      email: data.email,
      passwordHash,
    };

    return this.authorRepository.create(repositoryData);
  }

  async updateAuthor(id: string, data: UpdateAuthorData): Promise<Author> {
    await this.getAuthor(id);
    return this.authorRepository.update(id, data);
  }

  async deleteAuthor(id: string): Promise<void> {
    await this.getAuthor(id);
    await this.authorRepository.delete(id);
  }
}
