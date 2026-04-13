export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface CurrentUserResponse {
  id: string;
  name: string;
  email: string;
  roles: string[];
}
