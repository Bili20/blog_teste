import { Author } from "@/domain/entities/Author";
import {
  CreateAuthorData,
  UpdateAuthorData,
} from "@/domain/interfaces/repositories/IAuthorRepository";

export interface IAuthorService {
  listAuthors(): Promise<Author[]>;
  getAuthor(id: string): Promise<Author>;
  createAuthor(data: CreateAuthorData): Promise<Author>;
  updateAuthor(id: string, data: UpdateAuthorData): Promise<Author>;
  deleteAuthor(id: string): Promise<void>;
}
