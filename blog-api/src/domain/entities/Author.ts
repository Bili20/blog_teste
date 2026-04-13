export interface Author {
  id: string;
  name: string;
  initials: string;
  bio: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthorWithCredentials extends Author {
  passwordHash: string;
  roles: string[];
}
