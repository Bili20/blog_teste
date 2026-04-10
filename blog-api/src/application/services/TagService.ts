import slugify from "slugify";
import { Tag } from "@/domain/entities/Tag";
import {
  ITagRepository,
  CreateTagData,
} from "@/domain/interfaces/repositories/ITagRepository";
import { ITagService } from "@/domain/interfaces/services/ITagService";
import { NotFoundError, ConflictError } from "@/shared/errors/AppError";

export class TagService implements ITagService {
  constructor(private readonly tagRepository: ITagRepository) {}

  async listTags(): Promise<Tag[]> {
    return this.tagRepository.findAll();
  }

  async getTag(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) throw new NotFoundError("Tag");
    return tag;
  }

  async createTag(data: CreateTagData): Promise<Tag> {
    const slug =
      data.slug ||
      slugify(data.name, { lower: true, strict: true, trim: true });

    const existing = await this.tagRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError(`Tag "${slug}" already exists`);
    }

    return this.tagRepository.create({ name: data.name, slug });
  }

  async deleteTag(id: string): Promise<void> {
    await this.getTag(id);
    await this.tagRepository.delete(id);
  }
}
