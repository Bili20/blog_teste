import { Author } from "@/domain/entities/Author";

export interface IAuthorRepository {
  findAll(): Promise<Author[]>;
  findById(id: string): Promise<Author | null>;
  create(data: CreateAuthorData): Promise<Author>;
  update(id: string, data: UpdateAuthorData): Promise<Author>;
  delete(id: string): Promise<void>;
}

export interface CreateAuthorData {
  name: string;
  initials: string;
  bio?: string;
}

export interface UpdateAuthorData {
  name?: string;
  initials?: string;
  bio?: string;
}
