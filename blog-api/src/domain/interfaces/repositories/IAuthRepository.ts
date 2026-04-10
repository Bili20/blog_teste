import { AuthorWithCredentials } from "@/domain/entities/Author";

export interface IAuthRepository {
  findByEmail(email: string): Promise<AuthorWithCredentials | null>;
}
