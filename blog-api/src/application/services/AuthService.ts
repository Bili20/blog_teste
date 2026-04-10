import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IAuthRepository } from "@/domain/interfaces/repositories/IAuthRepository";
import { IAuthService } from "@/domain/interfaces/services/IAuthService";
import { LoginResponse } from "@/domain/entities/Auth";
import { UnauthorizedError } from "@/shared/errors/AppError";

export class AuthService implements IAuthService {
  constructor(private readonly authRepository: IAuthRepository) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const author = await this.authRepository.findByEmail(email);

    if (!author) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(password, author.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not configured");
    }

    const payload = {
      sub: author.id,
      email: author.email,
      roles: author.roles,
    };

    const accessToken = jwt.sign(payload, secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN ??
        "7d") as jwt.SignOptions["expiresIn"],
    });

    return {
      accessToken,
      author: {
        id: author.id,
        name: author.name,
        email: author.email,
        roles: author.roles,
      },
    };
  }
}
