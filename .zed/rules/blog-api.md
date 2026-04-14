# blog-api — Backend Rules

## Project Overview

REST API for **The Margin Blog**, built with **Node.js + TypeScript + Express + Prisma + SQLite**.
This is the `blog-api` package inside the `blog_teste` monorepo.

Entry points:
- `src/server.ts` — HTTP server bootstrap
- `src/app.ts` — Express app factory + manual dependency injection wiring

---

## Architecture: Clean Architecture (Strict Layering)

The project follows Clean Architecture. **Dependencies must point inward only.**

```
Presentation → Application → Domain ← Infrastructure
                                ↑
                             Shared (imported by any layer)
```

### Layer Map

| Layer | Path | Responsibility |
|---|---|---|
| Domain | `src/domain/` | Pure TS interfaces and entities. No framework imports. No imports from other project layers. |
| Application | `src/application/services/` | Business rules. Receives repository interfaces via constructor injection. Never imports Express, Prisma, or any infrastructure library directly. |
| Infrastructure | `src/infrastructure/` | Prisma repositories + DB singleton. Only layer that imports Prisma. |
| Presentation | `src/presentation/` | Controllers, routes, middlewares, decorators. Only layer that imports Express request/response types directly. |
| Shared | `src/shared/` | `AppError` hierarchy, Zod schemas, utility types. Importable from any layer. |

**Hard rules:**
- `Domain` imports nothing from the project.
- `Application` services never import from `infrastructure/` or `presentation/`.
- `Infrastructure` repositories never import from `application/` or `presentation/`.
- `Presentation` controllers never contain business logic — they validate input and call services.

---

## Tech Stack

| Concern | Library |
|---|---|
| Runtime | Node.js (CommonJS — `"module": "CommonJS"` in tsconfig) |
| Framework | Express 4 + `express-async-errors` |
| ORM | Prisma (latest) with `@prisma/adapter-libsql` |
| Database | SQLite via LibSQL |
| Validation | Zod 3 — **all** validation at the controller boundary |
| Auth | `jsonwebtoken` + `bcryptjs` (10 salt rounds) |
| Slug | `slugify` |
| Dev runner | `tsx` |
| Build | `tsc` → `dist/` |

---

## Path Alias

All internal imports use the `@/*` alias (maps to `src/*`):

```typescript
import { Post } from "@/domain/entities/Post";
import { AppError } from "@/shared/errors/AppError";
```

Never use relative paths that traverse more than one directory level. Prefer `@/` aliases.

---

## Coding Patterns

### Controllers

- Controllers are **classes** with **arrow-function methods** (preserves `this` context when passed as Express callbacks).
- Constructor receives a service **interface**, never a concrete class.
- Each method: validate with Zod → call service → send JSON response.
- No business logic inside controllers.
- Never `try/catch` in controllers — let errors propagate to the global `errorHandler`.

```typescript
export class PostController {
  constructor(private readonly postService: IPostService) {}

  createPost = async (req: Request, res: Response): Promise<void> => {
    const data = createPostSchema.parse(req.body); // throws ZodError on failure
    const post = await this.postService.createPost(data);
    res.status(201).json(post);
  };
}
```

### Services

- Services are **classes** that implement the corresponding service interface from `domain/interfaces/services/`.
- Constructor receives a repository **interface** via constructor injection.
- Throw `AppError` subclasses for domain violations (never raw `Error` for business rules).
- Never import Express, Prisma, or any infrastructure library.

### Repositories

- One concrete Prisma repository per domain entity.
- Implement the corresponding `IXxxRepository` interface from `domain/interfaces/repositories/`.
- Only Prisma layer. Never expose Prisma types outside this layer — map to domain types.
- Use shared `INCLUDE` constants (e.g. `POST_INCLUDE`) to keep select shapes consistent.

### Routes

- Route files export a **factory function** `(controller) => Router`.
- Middleware decorator chain is declared here (not in controllers).

```typescript
export function postRoutes(controller: PostController): Router {
  const router = Router();
  router.get("/", controller.listPosts);
  router.post("/", authenticate, requireRole("admin", "author"), controller.createPost);
  return router;
}
```

### Auth Decorators

Two Express middlewares following the Decorator pattern:

- `authenticate` — reads access token from HTTP-only cookie, verifies JWT, sets `req.user`.
- `requireRole(...roles)` — checks `req.user.roles` includes at least one of the provided roles.

Chain order: `authenticate → requireRole("admin") → controller.method`

**Token transport rule:** Both access and refresh tokens travel via **HTTP-only cookies** only. Never use `Authorization: Bearer` header as the primary transport.

---

## Domain Types Pattern

Deliberate separation between repository-level and service-level input types:

```
IXxxRepository  → data types for the DB layer   (e.g. CreateAuthorRepositoryData with passwordHash)
IXxxService     → data types for the HTTP layer  (e.g. CreateAuthorInput with plain password)
```

This prevents leaking infrastructure details (e.g. `passwordHash`) up to the controller layer.

---

## Error Handling

Always use the `AppError` hierarchy from `@/shared/errors/AppError`:

| Class | HTTP Status | When to use |
|---|---|---|
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Duplicate slug, email already taken, etc. |
| `ValidationError` | 422 | Business-rule validation failure |
| `UnauthorizedError` | 401 | Missing or invalid token |
| `ForbiddenError` | 403 | Authenticated but insufficient permissions |

Global `errorHandler` (must stay **last** in `app.ts`) handles:
1. `ZodError` → 422 with `{ error: "Validation Error", issues: [...] }`
2. `AppError` subclass → status code from the error with `{ error: name, message }`
3. Unknown → 500 (message hidden in production)

Never `try/catch` in a controller unless handling the error locally.

---

## Validation (Zod)

- All Zod schemas live **exclusively** in `src/shared/utils/schemas.ts`.
- Naming convention: `createXxxSchema`, `updateXxxSchema`, `listXxxQuerySchema`.
- Always export inferred types alongside the schema:

```typescript
export const createTagSchema = z.object({ ... });
export type CreateTagInput = z.infer<typeof createTagSchema>;
```

- `updateXxxSchema` is always `createXxxSchema.partial()`.
- Services **do not validate** — they assume the controller already validated.

---

## Dependency Injection

Manual constructor injection. No DI container. Wiring order in `app.ts`:

1. `PrismaClient` (singleton from `infrastructure/database/prisma.ts`)
2. Repositories (receive `PrismaClient`)
3. Services (receive Repository interfaces)
4. Controllers (receive Service interfaces)
5. Route factories (receive Controllers)
6. `app.use(...)` — register routers

### Checklist for a new resource (e.g. `Comment`)

1. Entity interface in `src/domain/entities/Comment.ts`
2. Repository interface in `src/domain/interfaces/repositories/ICommentRepository.ts`
3. Service interface in `src/domain/interfaces/services/ICommentService.ts`
4. Service in `src/application/services/CommentService.ts`
5. Prisma repository in `src/infrastructure/repositories/PrismaCommentRepository.ts`
6. Controller in `src/presentation/controllers/CommentController.ts`
7. Routes in `src/presentation/routes/comment.routes.ts`
8. Wire in `src/app.ts`

---

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Source files (classes) | PascalCase | `PostService.ts`, `PrismaPostRepository.ts` |
| Source files (factories/utils) | camelCase | `post.routes.ts`, `schemas.ts` |
| Classes | PascalCase | `PostService`, `PrismaPostRepository` |
| Interfaces | `I` prefix + PascalCase | `IPostService`, `IPostRepository` |
| Zod schemas | camelCase + `Schema` | `createPostSchema` |
| Zod inferred types | PascalCase + `Input` | `CreatePostInput` |
| Repository input types | PascalCase + `Data` | `CreatePostData` |
| Error classes | PascalCase + `Error` | `NotFoundError` |
| Constants | SCREAMING_SNAKE_CASE | `POST_INCLUDE`, `ACCESS_TOKEN_COOKIE_NAME` |
| DB table names | snake_case via `@@map` | `@@map("posts")` |
| DB column names | snake_case via `@map` | `@map("password_hash")` |

---

## TypeScript Rules

- `strict: true` is enabled — never disable or suppress with `@ts-ignore` without a comment.
- Never use `any` — use `unknown` and narrow, or define a proper interface.
- Entity types in `domain/entities/` are plain **interfaces**, not classes.
- Use `readonly` on injected dependencies: `private readonly postService: IPostService`.
- Explicit return types on all async controller/service methods: `Promise<void>` or `Promise<T>`.

---

## Database & Prisma

- Schema: `prisma/schema.prisma`. Never edit a migration file after it has been applied.
- Prisma `mode: "insensitive"` is **not supported** with the current SQLite/LibSQL setup — avoid it.
- `PrismaAuthRepository.findByEmail` returns `AuthorWithCredentials`. This type must **never** reach the HTTP layer — it exists only inside `AuthService.login()`.

---

## Auth & Cookies

- Access token cookie: `httpOnly`, path `/api`, `sameSite: "strict"`, `secure` in production.
- Refresh token cookie: `httpOnly`, path `/api/auth`, same flags.
- Raw refresh tokens are **never** stored — only the SHA-256 hash is persisted.
- On every successful token refresh: rotate (revoke old record, issue new).
- `GET /auth/me` must be DB-backed to return fresh profile data.

Environment variables:

| Variable | Description |
|---|---|
| `JWT_SECRET` | Required, min 32 chars in production. Server refuses to start without it. |
| `JWT_EXPIRES_IN` | Token lifespan. Default: `7d`. |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | Refresh token lifespan in days. |
| `DATABASE_URL` | LibSQL connection string. Default: `file:./dev.db`. |

---

## Route Registration Rules

- Register `/posts/manage` **before** `/:id` — otherwise Express treats `"manage"` as a post ID.
- Register the global `errorHandler` **last** in `app.ts`.
- CORS must have `credentials: true` so browsers can send auth cookies.
- Newly created authors intended for editorial access must receive the `author` role at creation time.

---

## API Endpoints Reference

Base URL: `http://localhost:3333/api`

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | — | Sets access + refresh token cookies |
| `POST` | `/auth/refresh` | — | Rotates refresh token, refreshes access token cookie |
| `POST` | `/auth/logout` | — | Revokes refresh token, clears both cookies |
| `GET` | `/auth/me` | JWT cookie | Returns authenticated current user |

### Posts
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/posts` | — | List public posts (paginated, filterable) |
| `GET` | `/posts/featured` | — | Get the featured post |
| `GET` | `/posts/slug/:slug` | — | Get post by slug |
| `GET` | `/posts/:id` | — | Get post by ID |
| `GET` | `/posts/manage` | JWT + admin or author | List managed posts (ownership-aware) |
| `POST` | `/posts` | JWT + admin or author | Create post |
| `PATCH` | `/posts/:id` | JWT + admin or author | Update post |
| `DELETE` | `/posts/:id` | JWT + admin or author | Delete post |

### Authors
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/authors` | — | List all authors |
| `GET` | `/authors/:id` | — | Get author by ID |
| `POST` | `/authors` | JWT + admin | Create author |
| `PATCH` | `/authors/:id` | JWT + admin | Update author (name, initials, bio only) |
| `DELETE` | `/authors/:id` | JWT + admin | Delete author |

### Tags
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/tags` | — | List all tags |
| `GET` | `/tags/:id` | — | Get tag by ID |
| `POST` | `/tags` | — | Create tag |
| `DELETE` | `/tags/:id` | — | Delete tag |

---

## Database Schema Summary

Models: `Author`, `Post`, `Tag`, `Role`, `AuthorRole` (join), `PostTag` (join), `Media`, `RefreshToken`.

Key constraints:
- `Author.email` — unique
- `Post.slug` — unique
- `Tag.slug` — unique
- `RefreshToken.tokenHash` — unique (SHA-256 of the raw token)

Cascade behaviour:
- `post_tags` — delete cascades from both `posts` and `tags`
- `author_roles` — delete cascades from both `authors` and `roles`
- `refresh_tokens` — delete cascades from `authors`

---

## Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | `tsx watch src/server.ts` |
| `npm run build` | `tsc` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:studio` | `prisma studio` |
| `npm run db:seed` | `tsx prisma/seed.ts` |
| `npm run db:reset` | migrate reset --force + seed |