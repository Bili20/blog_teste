import { Author } from "@/domain/entities/Author";
import {
  IAuthorRepository,
  CreateAuthorData,
  UpdateAuthorData,
} from "@/domain/interfaces/repositories/IAuthorRepository";
import { IAuthorService } from "@/domain/interfaces/services/IAuthorService";
import { NotFoundError } from "@/shared/errors/AppError";

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

  async createAuthor(data: CreateAuthorData): Promise<Author> {
    return this.authorRepository.create(data);
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
