export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  accessToken: string;
  author: {
    id: string;
    name: string;
    email: string;
    roles: string[];
  };
}
