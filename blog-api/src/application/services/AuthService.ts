import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { IAuthRepository } from "@/domain/interfaces/repositories/IAuthRepository";
import { IAuthService } from "@/domain/interfaces/services/IAuthService";
import { CurrentUserResponse, LoginResponse } from "@/domain/entities/Auth";
import { UnauthorizedError } from "@/shared/errors/AppError";
import {
  AUTH_ENV_KEYS,
  AUTH_ERROR_MESSAGES,
  AUTH_TOKEN_DEFAULTS,
} from "@/shared/constants/auth.constants";

export class AuthService implements IAuthService {
  constructor(private readonly authRepository: IAuthRepository) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const author = await this.authRepository.findByEmail(email);

    if (!author) {
      throw new UnauthorizedError(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const passwordMatches = await bcrypt.compare(password, author.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedError(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
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
      throw new UnauthorizedError(
        AUTH_ERROR_MESSAGES.AUTHENTICATED_USER_NOT_FOUND,
      );
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
      throw new UnauthorizedError(
        AUTH_ERROR_MESSAGES.AUTHENTICATED_USER_NOT_FOUND,
      );
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
      throw new UnauthorizedError(AUTH_ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    if (storedRefreshToken.revokedAt) {
      throw new UnauthorizedError(AUTH_ERROR_MESSAGES.REVOKED_REFRESH_TOKEN);
    }

    if (storedRefreshToken.expiresAt.getTime() <= Date.now()) {
      await this.authRepository.revokeRefreshToken(storedRefreshToken.id);
      throw new UnauthorizedError(AUTH_ERROR_MESSAGES.EXPIRED_REFRESH_TOKEN);
    }

    return storedRefreshToken;
  }

  private signAccessToken(payload: {
    sub: string;
    email: string;
    name: string;
    roles: string[];
  }): string {
    const secret = process.env[AUTH_ENV_KEYS.JWT_SECRET];

    if (!secret) {
      throw new Error(
        `${AUTH_ENV_KEYS.JWT_SECRET} environment variable is not configured`,
      );
    }

    return jwt.sign(payload, secret, {
      expiresIn: (process.env[AUTH_ENV_KEYS.JWT_EXPIRES_IN] ??
        AUTH_TOKEN_DEFAULTS.ACCESS_TOKEN_EXPIRES_IN) as jwt.SignOptions["expiresIn"],
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
      process.env[AUTH_ENV_KEYS.REFRESH_TOKEN_EXPIRES_IN_DAYS] ??
        AUTH_TOKEN_DEFAULTS.REFRESH_TOKEN_EXPIRES_IN_DAYS,
    );

    const safeExpiresInDays =
      Number.isFinite(expiresInDays) && expiresInDays > 0
        ? expiresInDays
        : AUTH_TOKEN_DEFAULTS.REFRESH_TOKEN_EXPIRES_IN_DAYS;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + safeExpiresInDays);

    return expiresAt;
  }
}
