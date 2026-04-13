import { CurrentUserResponse, LoginResponse } from "@/domain/entities/Auth";

export interface IAuthService {
  login(email: string, password: string): Promise<LoginResponse>;
  refreshToken(refreshToken: string): Promise<LoginResponse>;
  logout(refreshToken: string): Promise<void>;
  getCurrentUser(authorId: string): Promise<CurrentUserResponse>;
}
