# The Margin — Architecture Reference

> This document is the single source of truth for the project's structure, conventions,
> and design decisions. Update it whenever a meaningful architectural change is made.

---

## Table of Contents

1. [Monorepo Overview](#1-monorepo-overview)
2. [blog-api — Backend](#2-blog-api--backend)
   - 2.1 [Tech Stack](#21-tech-stack)
   - 2.2 [Clean Architecture Layers](#22-clean-architecture-layers)
   - 2.3 [Full Directory Tree](#23-full-directory-tree)
   - 2.4 [Layer Responsibilities](#24-layer-responsibilities)
   - 2.5 [Dependency Flow](#25-dependency-flow)
   - 2.6 [Database Schema](#26-database-schema)
   - 2.7 [API Endpoints](#27-api-endpoints)
   - 2.8 [Auth System](#28-auth-system)
   - 2.9 [Error Handling](#29-error-handling)
   - 2.10 [Validation](#210-validation)
   - 2.11 [Dependency Injection](#211-dependency-injection)
3. [blog-client — Frontend](#3-blog-client--frontend)
   - 3.1 [Tech Stack](#31-tech-stack)
   - 3.2 [Full Directory Tree](#32-full-directory-tree)
   - 3.3 [Routing](#33-routing)
   - 3.4 [State Management](#34-state-management)
   - 3.5 [Component Conventions](#35-component-conventions)
   - 3.6 [Styling System](#36-styling-system)
4. [Shared Conventions](#4-shared-conventions)
   - 4.1 [Naming Conventions](#41-naming-conventions)
   - 4.2 [TypeScript Rules](#42-typescript-rules)
5. [Development Workflow](#5-development-workflow)
6. [Adding New Features — Checklists](#6-adding-new-features--checklists)

---

## 1. Monorepo Overview

```
blog_teste/
├── blog-api/          # REST API — Node.js + Express + Prisma + SQLite
├── blog-client/       # SPA — React + Vite + TailwindCSS
├── ARCHITECTURE.md    # ← this file
└── AUTH.md            # Auth-specific rules (JWT, decorators, roles)
```

The two projects are **independent** — they do not share `node_modules`, `tsconfig`,
or any source files. Each has its own scripts and runs on its own port.

| Project | Default Port | Run Command |
|---|---|---|
| `blog-api` | `3333` | `npm run dev` |
| `blog-client` | `5173` | `npm run dev` |

---

## 2. blog-api — Backend

### 2.1 Tech Stack

| Concern | Library | Notes |
|---|---|---|
| Runtime | Node.js | CommonJS (`"module": "CommonJS"` in tsconfig) |
| Framework | Express 4 | `express-async-errors` for async error propagation |
| ORM | Prisma (latest) | Adapter: `@prisma/adapter-libsql` |
| Database | SQLite (`dev.db`) | Via LibSQL adapter; path configurable with `DATABASE_URL` |
| Validation | Zod 3 | All request bodies and query strings validated at the controller boundary |
| Auth | jsonwebtoken + bcryptjs | Stateless JWT; bcrypt with 10 salt rounds |
| Slug generation | slugify | Auto-generated from title when not provided |
| Type runner | tsx | Used for `dev`, `seed`, and other scripts |
| Build | tsc | Emits to `dist/` |

---

### 2.2 Clean Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                   Presentation                       │  ← HTTP in / HTTP out
│  controllers · routes · middlewares · decorators     │
├─────────────────────────────────────────────────────┤
│                   Application                        │  ← Business logic
│                    services                          │
├─────────────────────────────────────────────────────┤
│                     Domain                           │  ← Core types & contracts
│           entities · interfaces                      │
├─────────────────────────────────────────────────────┤
│                  Infrastructure                      │  ← External systems
│          database · repositories                     │
├─────────────────────────────────────────────────────┤
│                     Shared                           │  ← Cross-cutting
│              errors · utils · types                  │
└─────────────────────────────────────────────────────┘
```

**Rule:** dependencies point **inward only**.
- `Infrastructure` depends on `Domain`.
- `Application` depends on `Domain`.
- `Presentation` depends on `Application` and `Domain`.
- `Domain` depends on **nothing** else in the project.
- `Shared` can be imported by any layer.

---

### 2.3 Full Directory Tree

```
blog-api/
├── prisma/
│   ├── migrations/
│   │   ├── 20260410133003_init/migration.sql
│   │   └── 20260410182706_add_auth_tables/migration.sql
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app.ts                          # Express app factory + DI wiring
│   ├── server.ts                       # HTTP server bootstrap
│   │
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Auth.ts                 # JwtPayload, LoginResponse
│   │   │   ├── Author.ts              # Author, AuthorWithCredentials
│   │   │   ├── Post.ts                # Post, PostSummary, PostTag, PostAuthor
│   │   │   ├── Role.ts                # Role
│   │   │   └── Tag.ts                 # Tag
│   │   └── interfaces/
│   │       ├── repositories/
│   │       │   ├── IAuthRepository.ts
│   │       │   ├── IAuthorRepository.ts
│   │       │   ├── IPostRepository.ts
│   │       │   └── ITagRepository.ts
│   │       └── services/
│   │           ├── IAuthService.ts
│   │           ├── IAuthorService.ts
│   │           ├── IPostService.ts
│   │           └── ITagService.ts
│   │
│   ├── application/
│   │   └── services/
│   │       ├── AuthService.ts
│   │       ├── AuthorService.ts
│   │       ├── PostService.ts
│   │       └── TagService.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── prisma.ts              # Singleton PrismaClient with LibSQL adapter
│   │   └── repositories/
│   │       ├── PrismaAuthRepository.ts
│   │       ├── PrismaAuthorRepository.ts
│   │       ├── PrismaPostRepository.ts
│   │       └── PrismaTagRepository.ts
│   │
│   ├── presentation/
│   │   ├── controllers/
│   │   │   ├── AuthController.ts
│   │   │   ├── AuthorController.ts
│   │   │   ├── PostController.ts
│   │   │   └── TagController.ts
│   │   ├── decorators/
│   │   │   ├── authenticate.decorator.ts   # Validates Bearer JWT → req.user
│   │   │   └── requireRole.decorator.ts    # Checks req.user.roles
│   │   ├── middlewares/
│   │   │   ├── errorHandler.ts        # Global error handler (last middleware)
│   │   │   └── requestLogger.ts       # Method + URL + status + duration
│   │   └── routes/
│   │       ├── auth.routes.ts
│   │       ├── author.routes.ts
│   │       ├── post.routes.ts
│   │       └── tag.routes.ts
│   │
│   └── shared/
│       ├── errors/
│       │   └── AppError.ts            # AppError hierarchy
│       ├── types/
│       │   └── express.d.ts           # Extends Express.Request with req.user
│       └── utils/
│           └── schemas.ts             # All Zod schemas + inferred types
│
├── .env.example
├── AUTH.md
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

### 2.4 Layer Responsibilities

#### Domain — `src/domain/`

The innermost layer. Contains **no framework code**, **no imports from other
project layers**.

**Entities** are plain TypeScript interfaces (no classes):

| File | Exports |
|---|---|
| `Author.ts` | `Author`, `AuthorWithCredentials` |
| `Post.ts` | `Post`, `PostSummary`, `PostTag`, `PostAuthor` |
| `Tag.ts` | `Tag` |
| `Role.ts` | `Role` |
| `Auth.ts` | `JwtPayload`, `LoginResponse` |

**Interfaces** define the contracts that outer layers must fulfil.
Services reference repository interfaces — never concrete implementations.

Key type separation pattern used throughout:

```
IXxxRepository  → data types for the DB layer (e.g. CreateAuthorRepositoryData with passwordHash)
IXxxService     → data types for the HTTP layer (e.g. CreateAuthorInput with plain password)
```

This prevents leaking infrastructure details (e.g. `passwordHash`) up to the
controller and vice-versa.

---

#### Application — `src/application/services/`

Contains all **business rules**. Each service:
- Receives a repository interface via constructor injection.
- Implements the corresponding service interface from `domain/interfaces/services/`.
- Never imports Express, Prisma, or any infrastructure library directly.
- Throws `AppError` subclasses for domain violations.

| Service | Key logic |
|---|---|
| `AuthService` | `bcrypt.compare` password, `jwt.sign` token |
| `AuthorService` | `bcrypt.hash` password before creating author |
| `PostService` | Auto-generates slug from title via `slugify`; checks uniqueness |
| `TagService` | Auto-generates slug from name; checks for duplicates |

---

#### Infrastructure — `src/infrastructure/`

**`prisma.ts`** — creates a singleton `PrismaClient` via the LibSQL adapter.
The singleton is stored on `globalThis` to survive hot-reloads in development.

**Repositories** translate between domain types and Prisma types. They are the
only place where Prisma is imported.

`PrismaPostRepository` uses a shared `POST_INCLUDE` constant so the same
`author + tags` select shape is reused across all queries.

`PrismaAuthRepository.findByEmail` is the only repository that includes roles:
```
author → author_roles → role.name   →  string[]
```
It returns `AuthorWithCredentials` which is **never** returned to the HTTP layer —
it is used only inside `AuthService.login()`.

---

#### Presentation — `src/presentation/`

**Controllers** are classes with arrow-function methods (to preserve `this`
context when passed as Express callbacks). Each method:
1. Parses and validates the request with a Zod schema.
2. Calls the service.
3. Sends a JSON response.

Controllers never contain business logic.

**Routes** are factory functions `(controller) → Router`. They are where the
middleware decorator chain is declared.

**Decorators** are Express middleware that follow the **Decorator design pattern**:
they wrap the route handler with cross-cutting behaviour without touching the handler.

```
HTTP request
     ↓
authenticate            ← identity (who you are)
     ↓
requireRole("admin")   ← authorization (what you can do)
     ↓
controller.method       ← business handler
```

See `AUTH.md` for the full auth decorator reference.

**Middlewares:**
- `requestLogger` — logs `METHOD /path → STATUS (Nms)` with ANSI colour coding.
- `errorHandler` — must always be the **last** middleware registered in `app.ts`.
  Handles `ZodError`, `AppError` subclasses, and unknown errors.

---

#### Shared — `src/shared/`

Can be imported by any layer.

**`AppError` hierarchy:**

```
Error
└── AppError (statusCode, isOperational)
    ├── NotFoundError       → 404
    ├── ConflictError       → 409
    ├── ValidationError     → 422
    ├── UnauthorizedError   → 401
    └── ForbiddenError      → 403
```

**`schemas.ts`** — single file for all Zod schemas. Naming convention:
`createXxxSchema`, `updateXxxSchema`, `listXxxQuerySchema`.
Inferred types are exported alongside: `type CreateXxxInput = z.infer<typeof createXxxSchema>`.

**`express.d.ts`** — augments `Express.Request` to add the `user` field:
```typescript
user?: { sub: string; email: string; roles: string[]; iat?: number; exp?: number }
```

---

### 2.5 Dependency Flow

```
app.ts
  └─ creates repositories (Infrastructure)
  └─ injects into services (Application)
  └─ injects into controllers (Presentation)
  └─ passes controllers to route factories (Presentation)
  └─ registers routes on Express app
```

There is **no DI container** — wiring is done manually in `app.ts`.
This is intentional at the current scale. If the number of dependencies grows
significantly, consider `tsyringe` or `inversify`.

---

### 2.6 Database Schema

```
┌──────────────┐         ┌──────────────────┐         ┌──────────┐
│   authors    │────────<│   author_roles   │>────────│  roles   │
│──────────────│         │──────────────────│         │──────────│
│ id (PK)      │         │ authorId (FK, PK)│         │ id (PK)  │
│ name         │         │ roleId   (FK, PK)│         │ name     │
│ initials     │         └──────────────────┘         │ createdAt│
│ bio          │                                       └──────────┘
│ email        │◄── UNIQUE
│ passwordHash │
│ createdAt    │
│ updatedAt    │
└──────┬───────┘
       │ 1
       │
       │ N
┌──────▼───────┐         ┌──────────────────┐         ┌──────────┐
│    posts     │────────<│    post_tags     │>────────│   tags   │
│──────────────│         │──────────────────│         │──────────│
│ id (PK)      │         │ postId  (FK, PK) │         │ id (PK)  │
│ slug         │◄── UNIQUE│ tagId  (FK, PK) │         │ name     │
│ title        │         └──────────────────┘         │ slug     │◄── UNIQUE
│ subtitle     │                                       │ createdAt│
│ excerpt      │                                       └──────────┘
│ body         │
│ category     │
│ readTime     │
│ featured     │
│ published    │
│ createdAt    │
│ updatedAt    │
│ authorId(FK) │
└──────────────┘
```

**Cascade behaviour:**
- `post_tags`: delete cascades from both `posts` and `tags`.
- `author_roles`: delete cascades from both `authors` and `roles`.
- `refresh_tokens`: delete cascades from `authors`.

**Migrations** live in `prisma/migrations/` and are version-controlled.
Never edit a migration file after it has been applied to any shared environment.

### Refresh token persistence

The auth module now persists refresh tokens in a dedicated `refresh_tokens` table:

```text
┌────────────────────┐
│   refresh_tokens   │
│────────────────────│
│ id (PK)            │
│ tokenHash          │◄── UNIQUE
│ expiresAt          │
│ createdAt          │
│ revokedAt          │
│ authorId (FK)      │
└─────────┬──────────┘
          │ N
          │
          │ 1
┌─────────▼──────────┐
│      authors       │
└────────────────────┘
```

**Important rules:**
- raw refresh tokens are **not** stored in the database
- only a SHA-256 `tokenHash` is persisted
- refresh tokens can be revoked by setting `revokedAt`
- expired refresh tokens are rejected even if they were never explicitly revoked

---

### 2.7 API Endpoints

Base URL: `http://localhost:3333/api`

#### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | — | Sets access token cookie and refresh token cookie |
| `POST` | `/auth/refresh` | — | Rotates refresh token from cookie and refreshes the access token cookie |
| `POST` | `/auth/logout` | — | Revokes the current refresh token and clears both auth cookies |
| `GET` | `/auth/me` | `JWT cookie` | Returns the authenticated current user |

#### Posts

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/posts` | — | List public posts (paginated, filterable) |
| `GET` | `/posts/featured` | — | Get the featured post |
| `GET` | `/posts/slug/:slug` | — | Get post by slug |
| `GET` | `/posts/:id` | — | Get post by ID |
| `GET` | `/posts/manage` | `JWT + admin \| author` | List managed posts with backend ownership-aware pagination |
| `POST` | `/posts` | `JWT + admin \| author` | Create post |
| `PATCH` | `/posts/:id` | `JWT + admin \| author` | Update post |
| `DELETE` | `/posts/:id` | `JWT + admin \| author` | Delete post |

**`GET /posts` query parameters:**

| Param | Type | Description |
|---|---|---|
| `category` | `Essay \| Practice \| Work \| Tools` | Filter by category |
| `tag` | `string` | Filter by tag slug |
| `search` | `string` | Full-text search (title, subtitle, excerpt) |
| `published` | `boolean` | Default `true` |
| `page` | `number` | Default `1` |
| `limit` | `number` | Default `10`, max `100` |

**`GET /posts/manage` query parameters:**

| Param | Type | Description |
|---|---|---|
| `category` | `Essay \| Practice \| Work \| Tools` | Filter by category |
| `tag` | `string` | Filter by tag slug |
| `search` | `string` | Full-text search (title, subtitle, excerpt) |
| `published` | `boolean` | Optional; when omitted, returns both drafts and published posts for management |
| `page` | `number` | Default `1` |
| `limit` | `number` | Default `10`, max `100` |

**Ownership-aware management listing rule:**
- `admin` receives paginated results across all posts
- `author` receives paginated results only for posts where `post.authorId === req.user.sub`
- ownership filtering for `/posts/manage` is enforced in the backend service layer before pagination results are returned to the client
- `published` filtering for `/posts/manage` is optional:
  - when `published=true`, only published posts are returned
  - when `published=false`, only drafts are returned
  - when `published` is omitted, both drafts and published posts are included in the managed result set
- route declaration order matters: `/posts/manage` must be registered before `/:id`, otherwise Express will treat `"manage"` as a dynamic post ID and the protected management listing will never be reached
- newly created authors intended for editorial access should receive the default `author` role assignment during creation, otherwise they can authenticate but will not be allowed to manage posts
- Prisma string filters using `mode: "insensitive"` are not universally supported across all configured providers in this project setup
- for the current SQLite/libsql-backed configuration, post repository filtering should avoid relying on Prisma's `mode: "insensitive"` option unless provider support is explicitly confirmed

#### Authors

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/authors` | — | List all authors |
| `GET` | `/authors/:id` | — | Get author by ID |
| `POST` | `/authors` | `JWT + admin` | Create author |
| `PATCH` | `/authors/:id` | `JWT + admin` | Update author |
| `DELETE` | `/authors/:id` | `JWT + admin` | Delete author |

> `PATCH /authors/:id` only updates `name`, `initials`, and `bio`.
> Email and password changes are not exposed through this endpoint.

#### Tags

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/tags` | — | List all tags |
| `GET` | `/tags/:id` | — | Get tag by ID |
| `POST` | `/tags` | — | Create tag |
| `DELETE` | `/tags/:id` | — | Delete tag |

#### System

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns `{ status: "ok", timestamp }` |

---

### 2.8 Auth System

> Full detail is in `AUTH.md`. This section is a structural summary.

The auth module now uses a **cookie-based access token + cookie-based refresh token**
pattern at the API contract level.

Current flow:
1. `POST /auth/login`
   - validates credentials
   - sets the access token as an **HTTP-only cookie**
   - sets the refresh token as an **HTTP-only cookie**
   - stores only the hashed refresh token in `refresh_tokens`
2. `POST /auth/refresh`
   - reads the refresh token from the cookie
   - hashes it
   - validates the stored record
   - rejects revoked or expired tokens
   - revokes the old refresh token record
   - issues a new access token
   - rotates the refresh token cookie
   - refreshes the access token cookie
3. `POST /auth/logout`
   - reads the current refresh token from the cookie
   - revokes it if present and valid
   - clears the refresh token cookie
   - clears the access token cookie
4. `GET /auth/me`
   - reads the access token from the auth cookie
   - should remain DB-backed for current profile data

**Token transport rule:**
- both access tokens and refresh tokens should be transported through **HTTP-only cookies**
- the API should not require frontend JavaScript to read or persist either token directly
- protected routes should authenticate from the access token cookie instead of relying on `Authorization` header fallback

**Refresh token rotation rule:**
- every successful refresh invalidates the previous refresh token
- the old token cannot be reused after rotation

**Cookie and transport rules:**
- refresh token cookie path: `/api/auth`
- access token cookie path should cover protected API routes (current target: `/api`)
- both cookies should be `httpOnly`
- both cookies should be `sameSite=strict`
- both cookies should be `secure` in production
- auth CORS must allow credentials so browsers can send the auth cookies

**Environment variables in use:**
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_IN_DAYS`

**Flow:**
```
POST /api/auth/login
  └─ AuthController.login
       └─ loginSchema.parse(body)          ← Zod validation
       └─ AuthService.login(email, pass)
            └─ PrismaAuthRepository.findByEmail(email)
                 └─ author + roles via JOIN
            └─ bcrypt.compare(pass, hash)
            └─ jwt.sign({ sub, email, roles })
            └─ returns { accessToken, author }
```

**Protected route flow:**
```
Request with Authorization: Bearer <token>
  └─ authenticate middleware
       └─ jwt.verify(token, JWT_SECRET)
       └─ req.user = { sub, email, roles }
  └─ requireRole("admin") middleware
       └─ req.user.roles.includes("admin")
  └─ controller.method
```

**Environment variables required:**

| Variable | Description |
|---|---|
| `JWT_SECRET` | Min 32 chars in production. No default — server refuses to start without it |
| `JWT_EXPIRES_IN` | Token lifespan. Default: `7d` |
| `DATABASE_URL` | LibSQL connection string. Default: `file:./dev.db` |

---

### 2.9 Error Handling

All errors flow through the global `errorHandler` middleware registered last in
`app.ts`. The handler covers three cases:

1. **`ZodError`** → `422` with `{ error: "Validation Error", issues: [...] }`
2. **`AppError`** (any subclass) → `statusCode` from the error with `{ error: name, message }`
3. **Unknown** → `500`; message is hidden in production (`NODE_ENV === "production"`)

**Rule:** Never `try/catch` inside a controller unless you intend to handle the
error locally. Let errors propagate — `express-async-errors` patches Express to
forward async rejections to `next(err)` automatically.

---

### 2.10 Validation

All validation is done with **Zod** at the controller boundary — before the service
is called. Schemas live exclusively in `src/shared/utils/schemas.ts`.

Pattern:
```typescript
// In the controller
const data = createPostSchema.parse(req.body);  // throws ZodError on failure
await this.postService.createPost(data);         // only called with valid data
```

Services **do not validate** their inputs — they assume the controller already did.

---

### 2.11 Dependency Injection

Manual constructor injection. Wiring order in `app.ts`:

```
1. PrismaClient (singleton, from infrastructure/database/prisma.ts)
2. Repositories  (receive PrismaClient)
3. Services      (receive Repository interfaces)
4. Controllers   (receive Service interfaces)
5. Route factories (receive Controllers)
6. app.use(...)  (register routers)
```

When adding a new resource (e.g. `Comment`):
1. Create entity + interfaces in `domain/`.
2. Create service in `application/services/`.
3. Create repository in `infrastructure/repositories/`.
4. Create controller + routes in `presentation/`.
5. Wire everything in `app.ts`.

---

## 3. blog-client — Frontend

### 3.1 Tech Stack

| Concern | Library | Notes |
|---|---|---|
| Framework | React 19 | Strict Mode enabled |
| Build tool | Vite 8 | Plugin: `@vitejs/plugin-react` |
| Language | TypeScript 6 | `moduleResolution: bundler` |
| Routing | React Router DOM 6 | `BrowserRouter` |
| Styling | Tailwind CSS 3.4 | No CSS Modules |
| UI Primitives | Radix UI (full suite) | Wrapped via shadcn/ui pattern |
| Forms | React Hook Form + Zod | Available but not yet wired in pages |
| Icons | Lucide React | |
| Notifications | Sonner | |

**Path alias:** `@/` resolves to `./src/` (configured in both `vite.config.ts`
and `tsconfig.app.json`).

---

### 3.2 Full Directory Tree

```
blog-client/
├── src/
│   ├── main.tsx                     # React root — StrictMode + createRoot
│   ├── App.tsx                      # BrowserRouter + Layout + Routes
│   ├── index.css                    # Tailwind directives + CSS variables
│   │
│   ├── pages/
│   │   ├── HomePage.tsx             # Post archive with search + category filter
│   │   ├── ArticlePage.tsx          # Full post reader
│   │   ├── AboutPage.tsx            # Static about page
│   │   ├── LoginPage.tsx            # Auth login form
│   │   └── admin/
│   │       ├── CreatePostPage.tsx   # Create a new post (admin + author)
│   │       ├── EditPostPage.tsx     # Edit an existing post (admin + author)
│   │       ├── ManagePostsPage.tsx  # List and manage posts (admin + author)
│   │       ├── authors/
│   │       │   ├── ManageAuthorsPage.tsx  # List and manage authors (admin)
│   │       │   ├── CreateAuthorPage.tsx   # Create a new author (admin)
│   │       │   └── EditAuthorPage.tsx     # Edit an existing author (admin)
│   │       └── tags/
│   │           ├── ManageTagsPage.tsx     # List and manage tags (admin)
│   │           └── CreateTagPage.tsx      # Create a new tag (admin)
│   │
│   ├── components/
│   │   ├── AdminPagination.tsx      # Reusable previous/next pagination footer for admin lists
│   │   ├── AppHeader.tsx            # Shared site header with avatar menu + mobile sheet
│   │   ├── DeleteConfirmDialog.tsx  # Reusable destructive-action confirmation dialog
│   │   ├── FeaturedPost.tsx         # Hero card for the featured post
│   │   ├── Header.tsx               # Unused legacy header component
│   │   ├── PostCard.tsx             # List item card for non-featured posts
│   │   ├── PostForm.tsx             # Shared create/edit post form
│   │   └── ui/                      # shadcn/ui generated primitives (don't edit manually)
│   │       └── ...                  # (full Radix suite, including Sonner toaster wrapper)
│   │
│   ├── contexts/
│   │   └── AuthContext.ts           # Auth state shape (token, user, flags)
│   │
│   ├── guards/
│   │   ├── AdminRoute.tsx           # Route guard — admin role only
│   │   ├── ContentRoute.tsx         # Route guard — admin or author role
│   │   └── ProtectedRoute.tsx       # Route guard — authenticated only
│   │
│   ├── hooks/
│   │   └── useAuth.ts               # Consumes AuthContext
│   │
│   ├── providers/
│   │   └── AuthProvider.tsx         # Auth state, login/logout, session bootstrap
│   │
│   ├── services/
│   │   ├── api.ts                   # Configured axios instance (baseURL + auth header)
│   │   ├── authService.ts           # login(), refreshToken(), getCurrentUser()
│   │   ├── authorService.ts         # listAuthors(), createAuthor(), updateAuthor(), deleteAuthor()
│   │   ├── postService.ts           # listPosts(), createPost(), updatePost(), deletePost()
│   │   └── tagService.ts            # listTags(), createTag(), deleteTag()
│   │
│   ├── types/
│   │   ├── auth.ts                  # LoginRequest, AuthenticatedUser, AuthState
│   │   ├── author.ts                # Author, AuthorSummary
│   │   ├── post.ts                  # Post, PostSummary, PostFormInput, etc.
│   │   └── tag.ts                   # Tag, CreateTagRequest
│   │
│   └── lib/
│       └── utils.ts                 # cn() helper (clsx + tailwind-merge)
│
├── public/
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── package.json
```

---

### 3.3 Routing

Routes are declared in `App.tsx` inside `<BrowserRouter>`:

| Path | Component | Guard | Notes |
|---|---|---|---|
| `/` | `HomePage` | — | Post archive with search + category filter |
| `/about` | `AboutPage` | — | Static page |
| `/login` | `LoginPage` | — | Authentication form |
| `/post/:slug` | `ArticlePage` | — | Full article reader |
| `/admin/posts` | `ManagePostsPage` | `ContentRoute` | List + manage posts |
| `/admin/posts/new` | `CreatePostPage` | `ContentRoute` | Create post form |
| `/admin/posts/:id/edit` | `EditPostPage` | `ContentRoute` | Edit post form |
| `/admin/authors` | `ManageAuthorsPage` | `AdminRoute` | List + manage authors |
| `/admin/authors/new` | `CreateAuthorPage` | `AdminRoute` | Create author form |
| `/admin/authors/:id/edit` | `EditAuthorPage` | `AdminRoute` | Edit author form |
| `/admin/tags` | `ManageTagsPage` | `AdminRoute` | List + manage tags |
| `/admin/tags/new` | `CreateTagPage` | `AdminRoute` | Create tag form |
| `/:slug` | Redirect to `/` | — | Legacy slug fallback |
| `*` | Inline 404 | — | |

**Route guards:**

| Guard | File | Permitted roles |
|---|---|---|
| `ContentRoute` | `src/guards/ContentRoute.tsx` | `admin`, `author` |
| `AdminRoute` | `src/guards/AdminRoute.tsx` | `admin` |
| `ProtectedRoute` | `src/guards/ProtectedRoute.tsx` | any authenticated user |

**Layout** is a single `Layout` component defined in `App.tsx` that wraps all
routes. It renders:
- `AppHeader` as the sticky site header
- A `<main>` for page content
- A `<footer>`

`AppHeader.tsx` centralises authenticated and unauthenticated navigation using
existing shadcn/ui primitives:
- `DropdownMenu` for the desktop user menu
- `Avatar` for the logged-in identity trigger
- `Badge` for role chips
- `Sheet` for the mobile navigation drawer
- `Separator` for grouped mobile navigation sections

The older `Header.tsx` component in `src/components/` still exists but is
currently unused.

---

### 3.4 State Management

The client currently uses **local component state** and a single **React Context**:

| Mechanism | Where | What |
|---|---|---|
| `useState` | `HomePage` | `activeCategory`, `searchQuery` |
| `useMemo` | `HomePage` | `featuredPost`, `remainingPosts`, `filteredPosts` |
| `PostsContext` | `App.tsx` → all pages | `posts[]`, `categories[]` |

`PostsContext` is provided at the root and makes the mock data available to any
page without prop drilling. When the API is integrated, the context provider
should be updated to fetch from `blog-api` instead of importing from `mocks/`.

---

### 3.5 Component Conventions

**Pages** (`src/pages/`) — full-page views. Responsible for:
- Reading route params (`useParams`).
- Consuming context / calling hooks.
- Rendering layout sections.

**Components** (`src/components/`) — reusable UI pieces. Receive all data via
props. No direct context consumption inside components (except ui/).

**UI primitives** (`src/components/ui/`) — generated by shadcn/ui. Do **not**
edit these files manually. Customise by wrapping them in a new component.

Current admin UX relies heavily on these primitives instead of custom controls:
- `Select` for post category and author selection
- `Dialog` for destructive-action confirmation flows
- `DropdownMenu` for authenticated desktop navigation
- `Sheet` for mobile navigation
- `Badge` for roles, categories, and status chips
- `Avatar` for the authenticated user trigger
- `Button` for reusable admin pagination controls
- `Sonner` for global success/error toast feedback
- `Select`, `Input`, and checkbox-based tag selection inside the shared post form

**Admin list pagination:**
- `ManagePostsPage` uses the protected `GET /posts/manage` endpoint with `page` + `limit`
- `/posts/manage` applies ownership-aware filtering in the backend:
  - `admin` paginates across all posts
  - `author` paginates only across owned posts
- `/posts/manage` also supports optional `published` filtering:
  - omit `published` to paginate across both drafts and published posts
  - send `published=true` to paginate only published posts
  - send `published=false` to paginate only drafts
- this avoids the previous UX issue where an `author` could land on pages with
  few or zero visible posts because filtering happened only in the client
- `ManageAuthorsPage` currently paginates client-side after loading all authors
- `ManageTagsPage` currently paginates client-side after loading all tags
- `AdminPagination.tsx` provides the shared previous/next footer used by admin
  listing screens
- current provider compatibility means server-side post filtering should prefer
  provider-safe Prisma string filters and avoid assuming `mode: "insensitive"`
  support in repository queries

**Credentialed auth transport:**
- backend CORS is configured with `credentials: true`
- auth cookie transport depends on browsers being allowed to send credentials
- cookie parsing happens in a lightweight request middleware before routes
- access tokens now travel through an auth cookie instead of being exposed in normal JSON responses
- refresh tokens now travel through the auth cookie instead of being exposed in normal JSON responses
- protected backend auth should now be treated as fully cookie-based

**Admin feedback improvements:**
- `App.tsx` mounts the shared `Toaster` from `src/components/ui/sonner.tsx`
- create, update, and delete flows now use toast feedback for success and error states
- inline error blocks are still kept where useful, but destructive and submit actions
  now also provide immediate global feedback
- current toast coverage includes posts, authors, and tags management flows

**Admin post filters:**
- `ManagePostsPage` supports management-oriented filtering on top of the protected
  `GET /posts/manage` endpoint
- current filters include:
  - `search` for title / subtitle / excerpt matching
  - `category` for editorial category narrowing
  - `published` status filtering for `published`, `draft`, or all posts
- filter changes reset pagination back to page `1` before requesting the next result set
- filters are applied server-side through query parameters instead of filtering only
  in the client, which keeps pagination totals accurate for both `admin` and `author`

**Post form rules:**
- `CreatePostPage` and `EditPostPage` both use the shared `PostForm` component
- tag options must be loaded for both create and edit flows so the editorial tag
  selector is available consistently in both screens
- the `featured` flag is an admin-only capability in the UI and should not be
  exposed as an editable control for users with only the `author` role
- backend write handling should also treat `featured` as admin-only so the rule
  is enforced even if a non-admin client submits the field manually

**Admin author and tag filters:**
- `ManageAuthorsPage` should support management-oriented filtering for author records
- recommended author filters:
  - `search` by `name`, `email`, or `initials`
  - optional role-based narrowing when role management becomes editable in the UI
- `ManageTagsPage` should support management-oriented filtering for tag records
- recommended tag filters:
  - `search` by `name` or `slug`
- until dedicated backend pagination/filter endpoints exist for authors and tags,
  these filters can be applied client-side on top of the current admin lists

**Home page editorial strip:**
- the `Long reads` strip directly below the header should remain intentionally limited
  to a small curated set of titles
- current rule: show only the first `4` post titles in that strip to avoid visual
  overload and preserve the editorial feel of the header area
- this strip is intentionally lightweight and should not expand into a second
  dense navigation bar beneath the main header

**Naming:**
- Pages: `PascalCase` + `Page` suffix — `HomePage.tsx`
- Components: `PascalCase` — `PostCard.tsx`
- Hooks: `camelCase` + `use` prefix — `useAuth.ts`
- Contexts: `PascalCase` + `Context` suffix — `AuthContext.ts`

**Variable naming rule (enforced):** No single-letter variables in callbacks or
`useMemo`. Use descriptive names:

```typescript
// ✅ correct
POSTS.map((post) => ...)
post.tags.map((tag) => ...)
parts.map((part, partIndex) => ...)
paragraphs.map((paragraph, index) => ...)

// ✗ wrong
POSTS.map((p) => ...)
post.tags.map((t) => ...)
```

---

### 3.6 Styling System

**Tailwind CSS 3.4** with the `tailwindcss-animate` plugin.

Design tokens in use:

| Token | Usage |
|---|---|
| `stone-*` | Primary neutral palette (backgrounds, text, borders) |
| `amber-700` | Brand accent (links, featured labels, CTA buttons) |
| `amber-400` | Featured text on dark backgrounds |
| Font: `font-serif` | Editorial content (titles, excerpts, body text) |
| Font: `font-sans` | UI chrome (nav, labels, badges) |

**Layout constraint:** `max-w-5xl mx-auto px-6` is the standard content width
used consistently across pages and the header/footer.

**Full-width elements** (e.g. the "Long reads" bar in `HomePage`) break out of
the page container and use a wrapping `w-full` div with an inner
`max-w-5xl mx-auto px-6` to keep content aligned.

---

## 4. Shared Conventions

### 4.1 Naming Conventions

| Artefact | Convention | Example |
|---|---|---|
| Files (API) | `PascalCase.ts` for classes, `camelCase.ts` for utilities | `PostService.ts`, `schemas.ts` |
| Files (Client) | `PascalCase.tsx` for components/pages | `PostCard.tsx` |
| Interfaces | `I` prefix for service/repository contracts | `IPostService` |
| Input types (service layer) | `CreateXxxInput`, `UpdateXxxInput` | `CreateAuthorInput` |
| Data types (repository layer) | `CreateXxxRepositoryData` | `CreateAuthorRepositoryData` |
| Zod schemas | `createXxxSchema`, `updateXxxSchema` | `createPostSchema` |
| DB tables | `snake_case` via `@@map` | `post_tags`, `author_roles` |
| DB columns | `camelCase` in Prisma, reflected in TypeScript | `passwordHash`, `readTime` |
| Routes | `kebab-case` resource nouns | `/api/posts`, `/api/auth/login` |
| Env variables | `SCREAMING_SNAKE_CASE` | `JWT_SECRET`, `DATABASE_URL` |

---

### 4.2 TypeScript Rules

**API (`blog-api`):**
- `strict: true` — no implicit `any`, no unchecked index access.
- `target: ES2022`, `module: CommonJS`.
- Path alias `@/` → `src/`.
- Files in `prisma/` are **not** in the tsconfig `include` — they run via `tsx`
  directly. Do not rely on path aliases in seed files.

**Client (`blog-client`):**
- `strict` implied by `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
- `moduleResolution: bundler` (Vite-compatible).
- `erasableSyntaxOnly: true` — no TypeScript-only syntax that requires emit (enums,
  namespaces, decorators) in source files.
- Path alias `@/` → `src/`.

---

## 5. Development Workflow

### blog-api scripts

```bash
npm run dev          # tsx watch — hot reload
npm run build        # tsc → dist/
npm run start        # node dist/server.js

npm run db:migrate   # prisma migrate dev (create + apply migration)
npm run db:generate  # prisma generate (regenerate client after schema change)
npm run db:seed      # tsx prisma/seed.ts
npm run db:studio    # Prisma Studio GUI
npm run db:reset     # migrate reset --force + re-seed (dev only)
```

**After any `schema.prisma` change:**
1. `npm run db:migrate` — creates migration + applies it.
2. `npm run db:generate` — regenerates the Prisma client.
3. Restart the TypeScript language server in the IDE to clear stale type cache.

### blog-client scripts

```bash
npm run dev          # Vite dev server (HMR)
npm run build        # tsc -b + vite build → dist/
npm run preview      # Preview production build
npm run lint         # eslint
```

---

## 6. Adding New Features — Checklists

### New API Resource (e.g. `Comment`)

- [ ] Add model to `prisma/schema.prisma`
- [ ] Run `npm run db:migrate -- --name add_comments`
- [ ] Run `npm run db:generate`
- [ ] `src/domain/entities/Comment.ts` — entity interface
- [ ] `src/domain/interfaces/repositories/ICommentRepository.ts` — CRUD contract + data types
- [ ] `src/domain/interfaces/services/ICommentService.ts` — service contract + input types
- [ ] `src/application/services/CommentService.ts` — business logic
- [ ] `src/infrastructure/repositories/PrismaCommentRepository.ts` — Prisma impl
- [ ] `src/presentation/controllers/CommentController.ts` — parse + delegate
- [ ] `src/presentation/routes/comment.routes.ts` — router factory
- [ ] Add Zod schemas to `src/shared/utils/schemas.ts`
- [ ] Wire everything in `src/app.ts`
- [ ] Seed sample data in `prisma/seed.ts`
- [ ] Add protected routes with `authenticate` + `requireRole` where appropriate

### New Protected Route

```typescript
// In any route file
import { authenticate } from "@/presentation/decorators/authenticate.decorator";
import { requireRole } from "@/presentation/decorators/requireRole.decorator";

router.post("/resource", authenticate, requireRole("admin"), controller.create);
```

### New Role

1. Insert into `roles` table (migration or seed).
2. Assign via `author_roles` to the relevant authors.
3. Use `requireRole("new-role")` on the routes that need it.
4. No changes to `AuthService` or decorators required.

### New Client Page

- [ ] Create `src/pages/NewPage.tsx`
- [ ] Add `<Route path="/new-path" element={<NewPage />} />` in `App.tsx`
- [ ] Use `max-w-5xl mx-auto px-6 py-12` as the outer container
- [ ] No single-letter variables in callbacks or `useMemo`

### New Client Component

- [ ] Create `src/components/ComponentName.tsx`
- [ ] Export as named export: `export const ComponentName: React.FC<Props> = ...`
- [ ] Receive all data via props — no direct context reads inside components
- [ ] Use only `stone-*` and `amber-*` palette tokens unless there is a strong reason

---

*Last updated: after auth system implementation (JWT + RBAC + route decorators).*