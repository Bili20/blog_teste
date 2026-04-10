import { Author } from "@/domain/entities/Author";
import { UpdateAuthorData } from "@/domain/interfaces/repositories/IAuthorRepository";

export interface CreateAuthorInput {
  name: string;
  initials: string;
  bio?: string;
  email: string;
  password: string;
}

export interface IAuthorService {
  listAuthors(): Promise<Author[]>;
  getAuthor(id: string): Promise<Author>;
  createAuthor(data: CreateAuthorInput): Promise<Author>;
  updateAuthor(id: string, data: UpdateAuthorData): Promise<Author>;
  deleteAuthor(id: string): Promise<void>;
}
