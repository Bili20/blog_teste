# Login Integration Progress

> This document tracks the frontend login integration with `blog-api`.
> Scope started as **authentication only**, and now reflects the current
> implementation based on a **token + current-user** flow.
>
> Current auth contract:
> - `POST /api/auth/login` returns only the JWT access token
> - `GET /api/auth/me` returns the authenticated user profile
> - the frontend stores token and user separately
> - the frontend uses the authenticated user as the source of truth for admin identity

---

## Goal

Integrate the frontend with the backend auth module using:

- `axios`
- a dedicated login page
- client-side auth state
- token persistence
- current-user fetch after login
- protected route support for admin-only areas

---

## Backend Contract

### 1. Login endpoint
`POST /api/auth/login`

#### Request body
```json
{
  "email": "mara@themargin.com",
  "password": "admin123"
}
```

#### Success response
```json
{
  "accessToken": "<jwt>"
}
```

#### Error responses
- `401 Unauthorized` → invalid credentials
- `422 Validation Error` → invalid payload

---

### 2. Current user endpoint
`GET /api/auth/me`

#### Headers
```http
Authorization: Bearer <jwt>
```

#### Success response
```json
{
  "id": "author-mara",
  "name": "Mara Voss",
  "email": "mara@themargin.com",
  "roles": ["admin"]
}
```

#### Error responses
- `401 Unauthorized` → missing, invalid, or expired token

---

## Current Frontend Scope

### Included in this phase
- install and configure `axios`
- create auth types
- create auth service for login
- create auth provider/context
- persist token and logged user separately
- fetch current user after login
- create login page
- add login route
- add logout logic
- prepare protected-route structure
- support admin-only navigation

### Explicitly excluded from this phase
- refresh token flow
- cookie-based auth
- token revocation
- rate limiting UI
- role management UI
- advanced session recovery UX

---

## Architectural Decisions

### 1. Current-user pattern
The frontend does **not** trust login to return the full user object anymore.

Flow:
1. call `POST /api/auth/login`
2. receive `accessToken`
3. persist token
4. call `GET /api/auth/me`
5. persist authenticated user
6. use that user in the app state

Reason:
- cleaner separation of concerns
- easier to evolve auth payloads
- better alignment with common backend auth patterns

---

### 2. Centralized auth state
Authentication state lives in a provider/context, not in pages.

Current state shape:
- `accessToken`
- `user`
- `isAuthenticated`
- `isLoading`
- `login()`
- `logout()`
- `refreshSession()`

---

### 3. Token persistence
Auth data is persisted in `localStorage` for now.

Current keys:
- `blog.auth.token`
- `blog.auth.user`

---

### 4. Axios centralization
A single configured API client is used for all requests.

It is responsible for:
- setting `baseURL`
- attaching `Authorization: Bearer <token>`
- being reused by all future modules

---

## Current Frontend Structure

```text
src/
├── contexts/
│   └── AuthContext.ts
├── guards/
│   ├── AdminRoute.tsx
│   └── ProtectedRoute.tsx
├── hooks/
│   └── useAuth.ts
├── pages/
│   └── LoginPage.tsx
├── providers/
│   └── AuthProvider.tsx
├── services/
│   ├── api.ts
│   └── authService.ts
├── types/
│   └── auth.ts
└── ...
```

---

## Current Types

### Login request
```ts
type LoginRequest = {
  email: string;
  password: string;
};
```

### Authenticated user
```ts
type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};
```

### Login response
```ts
type LoginResponse = {
  accessToken: string;
};
```

### Current user response
```ts
type CurrentUserResponse = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};
```

### Auth state
```ts
type AuthState = {
  accessToken: string | null;
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};
```

---

## UI Requirements for Login Page

The login page should contain:

- email field
- password field
- submit button
- loading state
- invalid credentials feedback
- redirect after success

Visual direction:
- keep the same editorial style already used in the project
- use `stone-*` and `amber-*`
- keep layout aligned with `max-w-* mx-auto px-6`
- avoid introducing a different visual language

---

## Validation Rules

Frontend validation should stay minimal and aligned with backend expectations:

- email must be a valid email
- password must have at least 6 characters

Important:
- backend remains the source of truth
- frontend validation is only for UX

---

## Error Handling Rules

### Login errors
Map backend responses to user-friendly messages:

- `401` → `Invalid email or password.`
- `422` → `Please review the form fields.`
- network/server error → `Unable to sign in right now. Try again in a moment.`

### Current user errors
Map backend responses to user-friendly behavior:

- `401` on `/auth/me` → clear local session
- invalid/expired token → force logout
- network/server error during session refresh → treat session as invalid unless retry logic is explicitly added later

### Security rule
Do not expose whether the email or password was wrong.

---

## Session Flow

### Login flow
```text
User submits email/password
  ↓
POST /api/auth/login
  ↓
Receive accessToken
  ↓
Persist token
  ↓
GET /api/auth/me
  ↓
Receive authenticated user
  ↓
Persist user
  ↓
Update AuthContext
  ↓
Redirect to target page
```

### Logout flow
```text
User clicks logout
  ↓
Clear token from storage
  ↓
Clear user from storage
  ↓
Reset AuthContext
  ↓
Protected routes become inaccessible
```

### Session refresh flow
```text
App starts
  ↓
Read token/user from storage
  ↓
If token exists, call refreshSession()
  ↓
GET /api/auth/me
  ↓
If success: update stored user
If failure: clear session
```

---

## Route Plan

### Public routes
- `/login`
- `/`
- `/about`

### Protected routes
- admin pages
- protected post CRUD pages

Protected route infrastructure is already in place.

---

## Completion Checklist

### Setup
- [x] `axios` installed
- [x] API client file created
- [x] auth types created
- [x] auth service created

### State
- [x] auth provider/context created
- [x] token persistence implemented
- [x] user persistence implemented
- [x] logout implemented
- [x] current-user fetch implemented after login
- [x] auth bootstrap from storage implemented
- [x] session refresh helper implemented

### UI
- [x] login page created
- [x] login form validation implemented
- [x] loading and error states implemented
- [x] login route added to router

### App integration
- [x] provider wired in app root
- [x] header updated to reflect auth state
- [x] protected route helper prepared
- [x] admin route helper prepared

### Cleanup
- [x] mock dependencies removed from auth flow
- [ ] app build fully validated end-to-end
- [x] auth no longer depends on user payload returned directly from login

---

## Current Security Posture

The current login module already follows some good practices:

- backend returns the same `401` message for invalid email and invalid password
- JWT is required for protected routes
- frontend stores token and user separately
- frontend no longer depends on user data returned directly from login
- current user is fetched through a dedicated endpoint
- admin-only frontend routes are separated from public routes

---

## Security Concerns Still Open

### 1. JWT stored in `localStorage`
This is still the main security tradeoff.

Risk:
- any XSS vulnerability in the frontend could expose the token

Current status:
- acceptable for the current stage
- not the strongest option for production-hardening

Recommended future improvement:
- move to secure `httpOnly` cookies if architecture allows

---

### 2. `/auth/me` should be DB-backed
The preferred behavior is for `/auth/me` to load the current user from the database
using the authenticated subject (`sub`) instead of relying only on token claims.

Why:
- user name changes should be reflected immediately
- role changes should be reflected immediately
- reduces stale identity data until token expiration

Current desired rule:
- token proves identity
- database provides current profile data

---

### 3. Missing rate limiting on login
There is still no brute-force protection documented for:

- `POST /api/auth/login`

Recommended future improvement:
- add rate limiting specifically to the login route

---

### 4. No token revocation
Current logout only clears the frontend session.

That means:
- the token remains valid until expiration
- there is no server-side invalidation yet

Recommended future improvement:
- refresh token rotation
- token versioning
- blocklist / revocation strategy

---

### 5. No refresh token flow
Current auth uses only a single access token.

Tradeoff:
- simpler implementation
- weaker long-session UX and revocation control

Recommended future improvement:
- short-lived access token
- refresh token endpoint
- rotation and invalidation strategy

---

### 6. No audit logging
There is no login audit trail yet.

Recommended future improvement:
- log login attempts
- log successful logins
- log suspicious auth failures if security requirements increase

---

## Security Backlog

### High priority
1. Make `/auth/me` load the current user from the database
2. Add rate limiting to `POST /api/auth/login`
3. Validate session refresh behavior end-to-end on app bootstrap

### Medium priority
4. Add refresh token support
5. Add token revocation / invalidation strategy
6. Add audit logging for login attempts

### Long-term / architectural
7. Consider migrating from `localStorage` JWT to secure `httpOnly` cookies
8. Add stronger session management and device/session visibility if needed

---

## Recommended Future Hardening

1. add rate limiting to `POST /api/auth/login`
2. make `/auth/me` always load the current user from the database
3. consider moving auth to secure `httpOnly` cookies
4. add refresh token support if session duration becomes a UX issue
5. add token revocation support
6. add audit logging for login attempts
7. review frontend XSS exposure before production rollout

---

## Dev Credentials

From backend seed:

- `mara@themargin.com` / `admin123`
- `sam@themargin.com` / `admin123`
- `lena@themargin.com` / `admin123`

---

## Final Rule

This auth module should now be treated as:

- functional for current development
- structurally ready for protected modules
- still requiring security hardening before production-grade rollout