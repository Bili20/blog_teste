import { Tag } from "@/domain/entities/Tag";
import { CreateTagData } from "@/domain/interfaces/repositories/ITagRepository";

export interface ITagService {
  listTags(): Promise<Tag[]>;
  getTag(id: string): Promise<Tag>;
  createTag(data: CreateTagData): Promise<Tag>;
  deleteTag(id: string): Promise<void>;
}
