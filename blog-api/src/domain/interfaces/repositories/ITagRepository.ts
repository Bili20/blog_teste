import { Tag } from "@/domain/entities/Tag";

export interface ITagRepository {
  findAll(): Promise<Tag[]>;
  findById(id: string): Promise<Tag | null>;
  findBySlug(slug: string): Promise<Tag | null>;
  create(data: CreateTagData): Promise<Tag>;
  delete(id: string): Promise<void>;
}

export interface CreateTagData {
  name: string;
  slug: string;
}
