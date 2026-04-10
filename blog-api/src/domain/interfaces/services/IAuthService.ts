import { LoginResponse } from "@/domain/entities/Auth";

export interface IAuthService {
  login(email: string, password: string): Promise<LoginResponse>;
}
