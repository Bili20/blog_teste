# Auth — Architecture & Rules

## Overview

Authentication is implemented using **JWT (JSON Web Tokens)** with a stateless,
Bearer-token strategy. Authorization is handled via a **role-based access control
(RBAC)** system backed by a dedicated `roles` table, linked to `authors` through a
many-to-many join table (`author_roles`).

---

## Domain Model

```
Author ────< AuthorRole >──── Role
 id              authorId         id
 email           roleId           name   (e.g. "admin")
 passwordHash
```

- An `Author` can hold **multiple roles** (many-to-many).
- The only role in the system at this time is **`admin`**.
- Roles are not hardcoded — they live in the `roles` table and can be extended
  without schema changes.

---

## Layer Responsibilities (Clean Architecture)

| Layer | Responsibility |
|---|---|
| **Domain** | `Auth.ts` (JwtPayload, LoginResponse), `AuthorWithCredentials`, `IAuthRepository`, `IAuthService` |
| **Application** | `AuthService` — validates credentials, signs JWT |
| **Infrastructure** | `PrismaAuthRepository` — fetches author + roles by email |
| **Presentation** | `AuthController`, `auth.routes.ts`, decorators |

> **Rule:** No JWT or bcrypt logic outside `AuthService` and the auth decorators.
> The domain layer must never import `jsonwebtoken` or `bcryptjs` directly.

---

## JWT Token

### Payload structure

```json
{
  "sub":   "<authorId>",
  "email": "author@themargin.com",
  "roles": ["admin"],
  "iat":   1700000000,
  "exp":   1700604800
}
```

### Configuration (`.env`)

| Variable | Description | Default |
|---|---|---|
| `JWT_SECRET` | Signing secret — **must be set in production** | — |
| `JWT_EXPIRES_IN` | Token lifespan (any `jsonwebtoken`-compatible value) | `7d` |

> **Rule:** `JWT_SECRET` must be at least 32 random characters in production.
> Never commit a real secret to version control.

---

## Auth Endpoint

### `POST /api/auth/login`

**Request body:**
```json
{
  "email":    "mara@themargin.com",
  "password": "admin123"
}
```

**Response `200`:**
```json
{
  "accessToken": "<jwt>",
  "author": {
    "id":    "<cuid>",
    "name":  "Mara Voss",
    "email": "mara@themargin.com",
    "roles": ["admin"]
  }
}
```

**Error responses:**
| Status | Reason |
|---|---|
| `401 Unauthorized` | Email not found or password incorrect |
| `422 Validation Error` | Malformed request body (Zod) |

> **Security rule:** Both "email not found" and "wrong password" return the same
> `401 Invalid credentials` message. Never reveal which field is wrong.

---

## Route Decorators

Decorators live at `src/presentation/decorators/` and are Express middleware
factories following the **Decorator design pattern** — they wrap a route handler
with cross-cutting concerns (auth, authorization) without modifying the handler
itself.

### `authenticate`

```typescript
import { authenticate } from "@/presentation/decorators/authenticate.decorator";

router.post("/", authenticate, controller.createPost);
```

- Reads the `Authorization: Bearer <token>` header.
- Verifies the JWT with `JWT_SECRET`.
- Attaches the decoded payload to `req.user`.
- Throws `401 UnauthorizedError` if the token is missing, malformed, or expired.

### `requireRole(...roles)`

```typescript
import { requireRole } from "@/presentation/decorators/requireRole.decorator";

router.post("/", authenticate, requireRole("admin"), controller.createPost);
```

- **Must always be applied after `authenticate`** — it depends on `req.user`.
- Checks whether any of the caller's roles match the allowed list.
- Throws `403 ForbiddenError` if the user lacks the required role.
- Throws `401 UnauthorizedError` if called without a prior `authenticate` (safety
  guard).

### Decorator order rule

```
route handler
     ↑
requireRole("admin")   ← authorization (what you can do)
     ↑
authenticate           ← authentication (who you are)
     ↑
HTTP request
```

---

## Protected Routes

| Method | Path | Guard |
|---|---|---|
| `POST` | `/api/posts` | `authenticate` + `requireRole("admin")` |
| `PATCH` | `/api/posts/:id` | `authenticate` + `requireRole("admin")` |
| `DELETE` | `/api/posts/:id` | `authenticate` + `requireRole("admin")` |

All other routes (`GET`) are **public**.

---

## Error Codes

| Class | HTTP | Name |
|---|---|---|
| `UnauthorizedError` | `401` | `UnauthorizedError` |
| `ForbiddenError` | `403` | `ForbiddenError` |

Both extend `AppError` and are handled by the global `errorHandler` middleware.

---

## Adding a New Role

1. Insert the role into the `roles` table (migration or seed).
2. Assign it to the relevant authors via `author_roles`.
3. Apply `requireRole("new-role")` to the routes that need it.

No code changes to `AuthService` or the decorators are required.

---

## Adding a New Protected Route

```typescript
// In any route file
import { authenticate } from "@/presentation/decorators/authenticate.decorator";
import { requireRole } from "@/presentation/decorators/requireRole.decorator";

router.post(
  "/some-resource",
  authenticate,
  requireRole("admin"),      // or requireRole("editor", "admin") for multiple
  controller.createResource,
);
```

---

## Seed Credentials (development only)

> These are dev-only credentials generated by `prisma/seed.ts`.
> **Never use them in production.**

| Email | Password | Role |
|---|---|---|
| `mara@themargin.com` | `admin123` | admin |
| `sam@themargin.com` | `admin123` | admin |
| `lena@themargin.com` | `admin123` | admin |

Run `npm run db:reset` to reset the database and re-apply the seed.

---

## Future Considerations

- **Refresh tokens**: Implement a `refresh_tokens` table with rotation logic when
  the `7d` expiry becomes a UX concern.
- **Password reset**: Add a `password_reset_tokens` table with short-lived, single-use
  tokens.
- **Token revocation**: For immediate invalidation, add a token blocklist (Redis or
  a DB table) and check it inside `authenticate`.
- **Rate limiting**: Apply a rate limiter (e.g. `express-rate-limit`) specifically to
  `POST /api/auth/login` to prevent brute-force attacks.
- **Audit log**: Record login events (timestamp, IP, author ID) in a separate table
  for security traceability.