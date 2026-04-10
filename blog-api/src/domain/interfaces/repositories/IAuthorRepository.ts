import { Author } from "@/domain/entities/Author";

export interface IAuthorRepository {
  findAll(): Promise<Author[]>;
  findById(id: string): Promise<Author | null>;
  create(data: CreateAuthorRepositoryData): Promise<Author>;
  update(id: string, data: UpdateAuthorData): Promise<Author>;
  delete(id: string): Promise<void>;
}

export interface CreateAuthorRepositoryData {
  name: string;
  initials: string;
  bio?: string;
  email: string;
  passwordHash: string;
}

export interface UpdateAuthorData {
  name?: string;
  initials?: string;
  bio?: string;
}
