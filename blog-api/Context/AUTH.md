# Auth — Architecture & Rules

## Overview

Authentication is implemented using **JWT (JSON Web Tokens)** with a stateless,
Bearer-token strategy. Authorization is handled via a **role-based access control
(RBAC)** system backed by a dedicated `roles` table, linked to `authors` through a
many-to-many join table (`author_roles`).

The current auth flow follows an **access-token + refresh-token + current-user**
pattern:

1. `POST /api/auth/login` validates credentials and returns an `accessToken`
2. the backend also sets the `refreshToken` as an **HTTP-only cookie**
3. `POST /api/auth/refresh` reads the refresh token (preferably from the cookie), rotates it, and returns a new access token
4. `POST /api/auth/logout` revokes the current refresh token and clears the cookie
5. `GET /api/auth/me` validates the access token and returns the authenticated user
6. Protected routes use `authenticate` + `requireRole(...)`

This keeps the access token available to the client while moving refresh token
transport to a safer cookie-based mechanism.

---

## Domain Model

```text
Author ────< AuthorRole >──── Role
 id              authorId         id
 email           roleId           name   (e.g. "admin", "author")
 passwordHash

Author ────< RefreshToken
 id              authorId
                 tokenHash
                 expiresAt
                 revokedAt
```

- An `Author` can hold **multiple roles** (many-to-many).
- The only role in the system at this time is **`admin`**.
- Roles are not hardcoded — they live in the `roles` table and can be extended
  without schema changes.

---

## Layer Responsibilities (Clean Architecture)

| Layer | Responsibility |
|---|---|
| **Domain** | `Auth.ts` (`JwtPayload`, `LoginResponse`, `RefreshTokenResponse`, `CurrentUserResponse`), `AuthorWithCredentials`, `IAuthRepository`, `IAuthService` |
| **Application** | `AuthService` — validates credentials, signs access tokens, issues refresh tokens, rotates refresh tokens |
| **Infrastructure** | `PrismaAuthRepository` — fetches author + roles from the database and persists refresh token records |
| **Presentation** | `AuthController`, `auth.routes.ts`, decorators |

> **Rule:** No JWT, bcrypt, token hashing, or refresh-token generation logic
> outside `AuthService` and the auth decorators.
> The domain layer must never import `jsonwebtoken`, `bcryptjs`, or `crypto`
> directly.
>
> **Prisma client regeneration rule:** Whenever the Prisma schema changes in a way
> that affects auth persistence types (for example adding `RefreshToken` or new
> auth-related fields/relations), the Prisma client must be regenerated before
> repository code will type-check correctly.

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
| `JWT_SECRET` | Signing secret for access tokens — **must be set in production** | — |
| `JWT_EXPIRES_IN` | Access token lifespan (any `jsonwebtoken`-compatible value) | `7d` |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | Refresh token lifespan in days | `30` |

> **Rule:** `JWT_SECRET` must be at least 32 random characters in production.
> Never commit a real secret to version control.

---

## Auth Endpoints

### `POST /api/auth/login`

Validates credentials, sets the auth cookies, and returns an empty success body.

**Request body:**
```json
{
  "email": "mara@themargin.com",
  "password": "admin123"
}
```

**Response `200`:**
```json
{}
```

**Set-Cookie:**
```text
accessToken=<jwt>; HttpOnly; SameSite=Strict; Path=/
refreshToken=<opaque-refresh-token>; HttpOnly; SameSite=Strict; Path=/api/auth
```

**Set-Cookie:**
```text
refreshToken=<opaque-refresh-token>; HttpOnly; SameSite=Strict; Path=/api/auth; Max-Age=2592000
```

**Error responses:**

| Status | Reason |
|---|---|
| `401 Unauthorized` | Email not found or password incorrect |
| `422 Validation Error` | Malformed request body (Zod) |

> **Security rule:** Both "email not found" and "wrong password" return the same
> `401 Invalid credentials` message. Never reveal which field is wrong.

---

### `POST /api/auth/refresh`

Rotates the current refresh token and returns a fresh access token while setting
a new refresh token cookie.

**Preferred transport:**
```text
Cookie: refreshToken=<opaque-refresh-token>
```

**Response `200`:**
```json
{}
```

**Set-Cookie:**
```text
accessToken=<jwt>; HttpOnly; SameSite=Strict; Path=/api
refreshToken=<new-opaque-refresh-token>; HttpOnly; SameSite=Strict; Path=/api/auth; Max-Age=2592000
```

**Error responses:**

| Status | Reason |
|---|---|
| `401 Unauthorized` | Missing, invalid, revoked, or expired refresh token |
| `422 Validation Error` | Malformed request body |

### Rotation rule

Refresh tokens are **single-use**:

1. browser sends the current refresh token through the cookie
2. server hashes it and looks it up in `refresh_tokens`
3. server rejects it if it is missing, revoked, or expired
4. server revokes the current stored token
5. server issues a new access token
6. server issues a new refresh token
7. server stores only the **hash** of the new refresh token
8. server sets the new raw refresh token in a fresh HTTP-only cookie
9. server also refreshes the access token cookie

This is a **refresh token rotation** flow. The raw refresh token is never stored
in plaintext in the database.

---

### `POST /api/auth/logout`

Revokes the current refresh token and clears both auth cookies.

**Preferred transport:**
```text
Cookie: refreshToken=<opaque-refresh-token>
```

**Response `204`:**
- no content

**Set-Cookie:**
```text
accessToken=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0
refreshToken=; HttpOnly; SameSite=Strict; Path=/api/auth; Max-Age=0
```

**Important behavior**
- if a refresh token cookie is present and valid, it is revoked
- both auth cookies are cleared
- logout does not require an access token in this implementation
- logout is idempotent from the client perspective because cookie clearing is
  always attempted

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
| `POST` | `/api/auth/refresh` | — |
| `POST` | `/api/auth/logout` | — |
| `GET` | `/api/auth/me` | `authenticate` (access token cookie) |

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

2. **Refresh token family reuse detection is not implemented**
   - the current implementation rotates tokens one-by-one
   - it does not yet detect suspicious reuse patterns across a token family

3. **Cookie hardening may still need environment-specific tuning**
   - current cookie transport uses `httpOnly`, `sameSite`, and environment-aware `secure`
   - production deployments may still need explicit domain / proxy / HTTPS review
   - access token cookie scope and lifetime should be reviewed carefully before production rollout

4. **Audit logging is not implemented**
   - login attempts and auth-sensitive actions are not yet recorded

5. **Password reset flow is not implemented**
   - there is no secure recovery mechanism yet

6. **Session invalidation on role change is not implemented**
   - if a user's roles change, existing access tokens may still carry stale claims until expiration
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

4. **Add global logout / revoke-all-sessions endpoint**
   - current logout revokes only the current refresh token
   - optionally add a route to revoke all refresh tokens for the current author

5. **Add audit logging**
   - log:
     - login success
     - login failure
     - refresh success
     - refresh failure
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

## Refresh Token Storage Model

Refresh tokens are stored in the database through a dedicated
`refresh_tokens` table.

### Stored fields

| Field | Purpose |
|---|---|
| `id` | Primary key |
| `tokenHash` | SHA-256 hash of the raw refresh token |
| `authorId` | Owner of the token |
| `expiresAt` | Expiration timestamp |
| `createdAt` | Creation timestamp |
| `revokedAt` | Revocation timestamp (`null` when active) |

### Important storage rules

- store only the **hash**, never the raw refresh token
- refresh tokens are **opaque random strings**, not JWTs
- a revoked token must never be accepted again
- an expired token should be treated as invalid and revoked when encountered
- rotation should revoke the previous token before issuing the next one

## Auth Cookie Transport

The backend now transports both access tokens and refresh tokens primarily
through HTTP-only cookies.

### Cookie attributes

| Cookie | Attribute | Purpose |
|---|---|---|
| `accessToken` | `HttpOnly` | Prevents JavaScript access in the browser |
| `accessToken` | `SameSite=Strict` | Reduces CSRF exposure for cross-site requests |
| `accessToken` | `Path=/api` | Makes the access token available to protected API routes without exposing it to unrelated site paths |
| `accessToken` | `Secure` | Enabled in production environments |
| `refreshToken` | `HttpOnly` | Prevents JavaScript access in the browser |
| `refreshToken` | `SameSite=Strict` | Reduces CSRF exposure for cross-site requests |
| `refreshToken` | `Path=/api/auth` | Limits refresh token scope to auth endpoints |
| `refreshToken` | `Secure` | Enabled in production environments |
| `refreshToken` | `Max-Age` | Matches refresh token lifetime |

### Transport rules

- `login` sets both the access token cookie and the refresh token cookie
- `refresh` reads the refresh token cookie and rotates both auth cookies on success
- `logout` clears both auth cookies even if the client session is already stale
- refresh token transport is cookie-based
- access token transport is cookie-based
- the frontend should not read or persist either token directly

---

## Future Considerations

- **Global logout**: Add a route to revoke all refresh tokens for the current author.
- **Refresh token family tracking**: Add parent/child linkage to detect token reuse.
- **Cookie domain strategy**: If the deployment spans subdomains, review whether an
  explicit cookie `domain` attribute is needed.
- **Password reset**: Add a `password_reset_tokens` table with short-lived, single-use
  tokens.
- **Token revocation**: For immediate invalidation of access tokens, add a token
  blocklist (Redis or a DB table) and check it inside `authenticate`.
- **Rate limiting**: Apply a rate limiter specifically to `POST /api/auth/login`.
- **Audit log**: Record login, refresh, and logout events (timestamp, IP, author ID) in a separate table.
- **Current-user DB lookup**: Keep `/auth/me` backed by the database, not only by JWT claims.
- **Prisma workflow discipline**: After any schema change that affects auth models,
  run Prisma generation before expecting repository types such as `prisma.refreshToken`
  to exist in TypeScript.

---