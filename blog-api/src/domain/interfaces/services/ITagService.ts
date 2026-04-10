import { Tag } from "@/domain/entities/Tag";

export interface CreateTagInput {
  name: string;
  slug?: string;
}

export interface ITagService {
  listTags(): Promise<Tag[]>;
  getTag(id: string): Promise<Tag>;
  createTag(data: CreateTagInput): Promise<Tag>;
  deleteTag(id: string): Promise<void>;
}
