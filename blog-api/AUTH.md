# Auth — Architecture & Rules

## Overview

Authentication is implemented using **JWT (JSON Web Tokens)** with a stateless,
Bearer-token strategy. Authorization is handled via a **role-based access control
(RBAC)** system backed by a dedicated `roles` table, linked to `authors` through a
many-to-many join table (`author_roles`).

The current auth flow follows a **token + current-user** pattern:

1. `POST /api/auth/login` validates credentials and returns only an `accessToken`
2. `GET /api/auth/me` validates the token and returns the authenticated user
3. Protected routes use `authenticate` + `requireRole(...)`

This keeps the login response minimal and makes the frontend fetch the current
user explicitly.

---

## Domain Model

```text
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
| **Domain** | `Auth.ts` (`JwtPayload`, `LoginResponse`, `CurrentUserResponse`), `AuthorWithCredentials`, `IAuthRepository`, `IAuthService` |
| **Application** | `AuthService` — validates credentials, signs JWT |
| **Infrastructure** | `PrismaAuthRepository` — fetches author + roles from the database |
| **Presentation** | `AuthController`, `auth.routes.ts`, decorators |

> **Rule:** No JWT or bcrypt logic outside `AuthService` and the auth decorators.
> The domain layer must never import `jsonwebtoken` or `bcryptjs` directly.

---

## JWT Token

### Payload structure

```json
{
  "sub": "author-id",
  "email": "author@themargin.com",
  "name": "Mara Voss",
  "roles": ["admin"],
  "iat": 1700000000,
  "exp": 1700604800
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

## Auth Endpoints

### `POST /api/auth/login`

Validates credentials and returns only the access token.

**Request body:**
```json
{
  "email": "mara@themargin.com",
  "password": "admin123"
}
```

**Response `200`:**
```json
{
  "accessToken": "<jwt>"
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

### `GET /api/auth/me`

Returns the authenticated user associated with the current token.

**Headers:**
```text
Authorization: Bearer <jwt>
```

**Response `200`:**
```json
{
  "id": "author-id",
  "name": "Mara Voss",
  "email": "mara@themargin.com",
  "roles": ["admin"]
}
```

**Error responses:**

| Status | Reason |
|---|---|
| `401 Unauthorized` | Missing, malformed, invalid, or expired token |

### Important implementation rule

`GET /api/auth/me` should **load the current user from the database** using the
authenticated subject (`sub`) from the token, instead of trusting token claims
alone for user profile data.

Why:
- user name can change
- roles can change
- token claims can become stale before expiration

Recommended flow:
1. `authenticate` validates the token and attaches `req.user`
2. controller/service reads `req.user.sub`
3. repository fetches the current author from the database
4. response is built from the database record

This keeps `/auth/me` consistent with the latest persisted state.

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

```text
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

### Auth
| Method | Path | Guard |
|---|---|---|
| `GET` | `/api/auth/me` | `authenticate` |

### Posts
| Method | Path | Guard |
|---|---|---|
| `POST` | `/api/posts` | `authenticate` + `requireRole("admin")` |
| `PATCH` | `/api/posts/:id` | `authenticate` + `requireRole("admin")` |
| `DELETE` | `/api/posts/:id` | `authenticate` + `requireRole("admin")` |

### Authors
| Method | Path | Guard |
|---|---|---|
| `POST` | `/api/authors` | `authenticate` + `requireRole("admin")` |
| `PATCH` | `/api/authors/:id` | `authenticate` + `requireRole("admin")` |
| `DELETE` | `/api/authors/:id` | `authenticate` + `requireRole("admin")` |

All public `GET` routes remain accessible without authentication unless explicitly
protected.

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
import { authenticate } from "@/presentation/decorators/authenticate.decorator";
import { requireRole } from "@/presentation/decorators/requireRole.decorator";

router.post(
  "/some-resource",
  authenticate,
  requireRole("admin"),
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

## Security Notes

### Current strengths

The current auth module already follows some good practices:

- login returns only the token, not the full user payload
- invalid email and invalid password return the same `401` response
- protected routes require JWT validation
- role checks are enforced server-side
- password hashing uses `bcrypt`
- current-user retrieval is separated from login

### Current limitations

The following items still need hardening:

1. **Rate limiting is not yet applied**
   - `POST /api/auth/login` should be protected against brute-force attempts

2. **Token revocation is not implemented**
   - logout only invalidates the session client-side
   - issued tokens remain valid until expiration

3. **Refresh tokens are not implemented**
   - long-lived access tokens are simpler, but less flexible
   - token rotation is not available yet

4. **Audit logging is not implemented**
   - login attempts and auth-sensitive actions are not yet recorded

5. **Password reset flow is not implemented**
   - there is no secure recovery mechanism yet

6. **Session invalidation on role change is not implemented**
   - if a user's roles change, existing tokens may still carry stale claims until expiration
   - this is another reason `/auth/me` should read from the database

---

## Recommended Future Security Hardening

### High priority

1. **Add rate limiting to `POST /api/auth/login`**
   - recommended package: `express-rate-limit`
   - apply a strict limit only to the login route

2. **Make `/auth/me` always load the user from the database**
   - use `req.user.sub` only as the lookup key
   - do not trust token claims as the source of truth for profile data

3. **Add token revocation strategy**
   - options:
     - token blocklist
     - token versioning on the user record
     - short-lived access tokens + refresh tokens

### Medium priority

4. **Add refresh token flow**
   - create a `refresh_tokens` table
   - support rotation and invalidation
   - keep access tokens short-lived

5. **Add audit logging**
   - log:
     - login success
     - login failure
     - logout
     - protected write actions
   - useful fields:
     - author ID
     - timestamp
     - IP
     - user agent

6. **Add password reset flow**
   - create `password_reset_tokens`
   - short-lived, single-use tokens only

### Long-term option

7. **Consider moving from local token storage to secure cookie-based auth**
   - if the frontend architecture allows it
   - use:
     - `httpOnly`
     - `secure`
     - `sameSite`
   - this reduces token exposure to XSS on the client side

---

## Future Considerations

- **Refresh tokens**: Implement a `refresh_tokens` table with rotation logic when
  the `7d` expiry becomes a UX concern.
- **Password reset**: Add a `password_reset_tokens` table with short-lived, single-use
  tokens.
- **Token revocation**: For immediate invalidation, add a token blocklist (Redis or
  a DB table) and check it inside `authenticate`.
- **Rate limiting**: Apply a rate limiter specifically to `POST /api/auth/login`.
- **Audit log**: Record login events (timestamp, IP, author ID) in a separate table.
- **Current-user DB lookup**: Keep `/auth/me` backed by the database, not only by JWT claims.

---