import { Request, Response } from "express";
import { IAuthService } from "@/domain/interfaces/services/IAuthService";
import { loginSchema } from "@/shared/utils/schemas";

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = loginSchema.parse(req.body);
    const result = await this.authService.login(email, password);
    res.status(200).json(result);
  };
}
