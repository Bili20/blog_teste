/*
  Warnings:

  - Added the required column `email` to the `authors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `authors` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "author_roles" (
    "authorId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    PRIMARY KEY ("authorId", "roleId"),
    CONSTRAINT "author_roles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "authors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "author_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_authors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "bio" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_authors" ("bio", "createdAt", "id", "initials", "name", "updatedAt") SELECT "bio", "createdAt", "id", "initials", "name", "updatedAt" FROM "authors";
DROP TABLE "authors";
ALTER TABLE "new_authors" RENAME TO "authors";
CREATE UNIQUE INDEX "authors_email_key" ON "authors"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
