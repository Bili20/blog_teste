export interface AuthorRole {
  id: string;
  name: string;
}

export interface Author {
  id: string;
  name: string;
  initials: string;
  bio: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
  roles: AuthorRole[];
}

export interface AuthorSummary {
  id: string;
  name: string;
  initials: string;
}
