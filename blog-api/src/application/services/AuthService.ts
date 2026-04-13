import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { IAuthRepository } from "@/domain/interfaces/repositories/IAuthRepository";
import { IAuthService } from "@/domain/interfaces/services/IAuthService";
import { CurrentUserResponse, LoginResponse } from "@/domain/entities/Auth";
import { UnauthorizedError } from "@/shared/errors/AppError";

const DEFAULT_ACCESS_TOKEN_EXPIRES_IN = "7d";
const DEFAULT_REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;

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

    return this.issueTokenPair({
      authorId: author.id,
      email: author.email,
      name: author.name,
      roles: author.roles,
    });
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const storedRefreshToken = await this.getValidRefreshToken(refreshToken);

    const author = await this.authRepository.findById(
      storedRefreshToken.authorId,
    );

    if (!author) {
      await this.authRepository.revokeRefreshToken(storedRefreshToken.id);
      throw new UnauthorizedError("Authenticated user not found");
    }

    await this.authRepository.revokeRefreshToken(storedRefreshToken.id);

    return this.issueTokenPair({
      authorId: author.id,
      email: author.email,
      name: author.name,
      roles: author.roles,
    });
  }

  async logout(refreshToken: string): Promise<void> {
    const storedRefreshToken = await this.getValidRefreshToken(refreshToken);
    await this.authRepository.revokeRefreshToken(storedRefreshToken.id);
  }

  async getCurrentUser(authorId: string): Promise<CurrentUserResponse> {
    const author = await this.authRepository.findById(authorId);

    if (!author) {
      throw new UnauthorizedError("Authenticated user not found");
    }

    return {
      id: author.id,
      name: author.name,
      email: author.email,
      roles: author.roles,
    };
  }

  private async issueTokenPair(params: {
    authorId: string;
    email: string;
    name: string;
    roles: string[];
  }): Promise<LoginResponse> {
    const accessToken = this.signAccessToken({
      sub: params.authorId,
      email: params.email,
      name: params.name,
      roles: params.roles,
    });

    const refreshToken = this.generateRefreshToken();
    const refreshTokenHash = this.hashRefreshToken(refreshToken);

    await this.authRepository.createRefreshToken({
      tokenHash: refreshTokenHash,
      authorId: params.authorId,
      expiresAt: this.getRefreshTokenExpiryDate(),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async getValidRefreshToken(refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);

    const storedRefreshToken =
      await this.authRepository.findRefreshTokenByHash(tokenHash);

    if (!storedRefreshToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (storedRefreshToken.revokedAt) {
      throw new UnauthorizedError("Refresh token has been revoked");
    }

    if (storedRefreshToken.expiresAt.getTime() <= Date.now()) {
      await this.authRepository.revokeRefreshToken(storedRefreshToken.id);
      throw new UnauthorizedError("Refresh token has expired");
    }

    return storedRefreshToken;
  }

  private signAccessToken(payload: {
    sub: string;
    email: string;
    name: string;
    roles: string[];
  }): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not configured");
    }

    return jwt.sign(payload, secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN ??
        DEFAULT_ACCESS_TOKEN_EXPIRES_IN) as jwt.SignOptions["expiresIn"],
    });
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString("hex");
  }

  private hashRefreshToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private getRefreshTokenExpiryDate(): Date {
    const expiresInDays = Number(
      process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ??
        DEFAULT_REFRESH_TOKEN_EXPIRES_IN_DAYS,
    );

    const safeExpiresInDays =
      Number.isFinite(expiresInDays) && expiresInDays > 0
        ? expiresInDays
        : DEFAULT_REFRESH_TOKEN_EXPIRES_IN_DAYS;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + safeExpiresInDays);

    return expiresAt;
  }
}
