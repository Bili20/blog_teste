export interface Author {
  id: string;
  name: string;
  initials: string;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthorWithCredentials extends Author {
  email: string;
  passwordHash: string;
  roles: string[];
}
