import { AuthorWithCredentials } from "@/domain/entities/Author";

export interface RefreshTokenRecord {
  id: string;
  tokenHash: string;
  authorId: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
}

export interface CreateRefreshTokenData {
  tokenHash: string;
  authorId: string;
  expiresAt: Date;
}

export interface IAuthRepository {
  findByEmail(email: string): Promise<AuthorWithCredentials | null>;
  findById(id: string): Promise<AuthorWithCredentials | null>;
  createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshTokenRecord>;
  findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  revokeRefreshToken(id: string): Promise<void>;
  revokeRefreshTokenByHash(tokenHash: string): Promise<void>;
}
