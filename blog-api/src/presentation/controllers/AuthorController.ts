import { Request, Response } from "express";
import { IAuthorService } from "@/domain/interfaces/services/IAuthorService";
import { createAuthorSchema, updateAuthorSchema } from "@/shared/utils/schemas";

export class AuthorController {
  constructor(private readonly authorService: IAuthorService) {}

  listAuthors = async (_req: Request, res: Response): Promise<void> => {
    const authors = await this.authorService.listAuthors();
    res.json(authors);
  };

  getAuthor = async (req: Request, res: Response): Promise<void> => {
    const author = await this.authorService.getAuthor(req.params.id);
    res.json(author);
  };

  createAuthor = async (req: Request, res: Response): Promise<void> => {
    const data = createAuthorSchema.parse(req.body);
    const author = await this.authorService.createAuthor(data);
    res.status(201).json(author);
  };

  updateAuthor = async (req: Request, res: Response): Promise<void> => {
    const data = updateAuthorSchema.parse(req.body);
    const author = await this.authorService.updateAuthor(req.params.id, data);
    res.json(author);
  };

  deleteAuthor = async (req: Request, res: Response): Promise<void> => {
    await this.authorService.deleteAuthor(req.params.id);
    res.status(204).send();
  };
}
