# Login Integration Progress

> This document tracks the frontend login integration with `blog-api`.
> Scope started as **authentication only**, and now reflects the current
> implementation based on a **cookie-based session + current-user** flow.
>
> Current auth contract:
> - `POST /api/auth/login` validates credentials and sets auth cookies
> - `POST /api/auth/refresh` rotates auth cookies and returns an empty success body
> - `POST /api/auth/logout` revokes the current refresh token and clears auth cookies
> - `GET /api/auth/me` returns the authenticated user profile
> - the frontend no longer stores JWT access tokens in `localStorage`
> - the frontend uses the authenticated user as the source of truth for admin identity

---

## Goal

Integrate the frontend with the backend auth module using:

- `axios`
- a dedicated login page
- client-side auth state
- cookie-based session handling
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
{}
```

#### Set-Cookie
```text
accessToken=<jwt>; HttpOnly; SameSite=Strict; Path=/
refreshToken=<opaque-refresh-token>; HttpOnly; SameSite=Strict; Path=/api/auth
```

#### Error responses
- `401 Unauthorized` → invalid credentials
- `422 Validation Error` → invalid payload

---

### 2. Current user endpoint
`GET /api/auth/me`

#### Auth transport
```http
Cookie: accessToken=<jwt>
```

Compatibility fallback:
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
- use cookie-based auth transport
- fetch current user after login
- create login page
- add login route
- add logout logic
- prepare protected-route structure
- support admin-only navigation

### Explicitly excluded from this phase
- rate limiting UI
- role management UI
- advanced session recovery UX

---

## Architectural Decisions

### 1. Current-user pattern
The frontend does **not** trust login to return the full user object anymore.

Flow:
1. call `POST /api/auth/login`
2. backend sets `accessToken` and `refreshToken` cookies
3. call `GET /api/auth/me`
4. persist authenticated user if desired for UX only
5. use that user in the app state

Reason:
- cleaner separation of concerns
- easier to evolve auth payloads
- better alignment with safer browser-based auth transport
- frontend no longer needs direct access to raw tokens

---

### 2. Centralized auth state
Authentication state lives in a provider/context, not in pages.

Current state shape:
- `user`
- `isAuthenticated`
- `isLoading`
- `login()`
- `logout()`
- `refreshSession()`

---

### 3. Token persistence
JWT tokens are **not** persisted in `localStorage` anymore.

Current rule:
- auth cookies are managed by the backend
- the browser sends them automatically with credentialed requests
- the frontend may cache the authenticated user for UX, but cookies remain the source of truth for session continuity

---

### 4. Axios centralization
A single configured API client is used for all requests.

It is responsible for:
- setting `baseURL`
- sending requests with credentials so auth cookies are included
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
type LoginResponse = Record<string, never>;
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

- `401` on `/auth/me` → attempt refresh flow, then clear session if refresh fails
- invalid/expired access cookie → force logout if refresh cannot recover the session
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
Backend sets auth cookies
  ↓
GET /api/auth/me
  ↓
Receive authenticated user
  ↓
Persist user if needed for UX
  ↓
Update AuthContext
  ↓
Redirect to target page
```

### Logout flow
```text
User clicks logout
  ↓
POST /api/auth/logout
  ↓
Backend clears auth cookies
  ↓
Clear user from storage if cached
  ↓
Reset AuthContext
  ↓
Protected routes become inaccessible
```

### Session refresh flow
```text
App starts
  ↓
Optionally read cached user from storage
  ↓
Call refreshSession()
  ↓
GET /api/auth/me
  ↓
If success: update stored user
If 401: optionally call POST /api/auth/refresh, then retry /auth/me
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
- [x] cookie-based session transport implemented
- [x] optional user persistence implemented
- [x] logout implemented
- [x] current-user fetch implemented after login
- [x] auth bootstrap implemented
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
- frontend no longer needs direct access to raw JWT tokens
- frontend no longer depends on user data returned directly from login
- current user is fetched through a dedicated endpoint
- admin-only frontend routes are separated from public routes

---

## Security Concerns Still Open

### 1. Auth cookies now replace `localStorage` token storage
The main auth transport has moved away from `localStorage`.

Improvement:
- `httpOnly` cookies reduce direct token exposure to frontend JavaScript

Current tradeoff:
- cookie configuration still needs careful production review
- cross-origin credential handling must be configured correctly
- CSRF protections should continue to be reviewed as the app evolves

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

### 4. Access token revocation is still limited
Current logout revokes the refresh token and clears cookies, but access tokens are still stateless.

That means:
- the refresh session is invalidated server-side
- already-issued access tokens remain valid until expiration unless additional revocation strategy is added

Recommended future improvement:
- token versioning
- blocklist / revocation strategy
- shorter access token lifetime if needed

---

### 5. Refresh token flow now exists, but frontend integration must stay aligned
Current auth now supports refresh token rotation through backend-managed cookies.

Current rule:
- frontend should not read or persist refresh tokens directly
- backend remains responsible for issuing, rotating, and clearing auth cookies

Recommended future improvement:
- validate refresh behavior end-to-end in the browser
- add stronger session visibility and revocation controls if needed

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
3. Validate cookie-based session refresh behavior end-to-end on app bootstrap

### Medium priority
4. Add stronger access token revocation / invalidation strategy
5. Add audit logging for login attempts
6. Add stronger session visibility and management controls

### Long-term / architectural
7. Review CSRF posture for all credentialed write requests
8. Add device/session visibility if needed

---

## Recommended Future Hardening

1. add rate limiting to `POST /api/auth/login`
2. make `/auth/me` always load the current user from the database
3. validate cookie-based login / refresh / logout end-to-end
4. add stronger token revocation support
5. add audit logging for login attempts
6. review CSRF posture for credentialed requests
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