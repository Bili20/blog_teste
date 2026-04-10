import { Request, Response } from "express";
import { ITagService } from "@/domain/interfaces/services/ITagService";
import { createTagSchema } from "@/shared/utils/schemas";

export class TagController {
  constructor(private readonly tagService: ITagService) {}

  listTags = async (_req: Request, res: Response): Promise<void> => {
    const tags = await this.tagService.listTags();
    res.json(tags);
  };

  getTag = async (req: Request, res: Response): Promise<void> => {
    const tag = await this.tagService.getTag(req.params.id);
    res.json(tag);
  };

  createTag = async (req: Request, res: Response): Promise<void> => {
    const data = createTagSchema.parse(req.body);
    const tag = await this.tagService.createTag(data);
    res.status(201).json(tag);
  };

  deleteTag = async (req: Request, res: Response): Promise<void> => {
    await this.tagService.deleteTag(req.params.id);
    res.status(204).send();
  };
}
