declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
        roles: string[];
        iat?: number;
        exp?: number;
      };
    }
  }
}

export {};
