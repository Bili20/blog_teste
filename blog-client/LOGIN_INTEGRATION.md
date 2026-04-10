# Login Integration Progress

> This document tracks the frontend login integration with `blog-api`.
> Scope is intentionally limited to **authentication only** for now.
> Do not start posts, authors, tags, or other modules until login is complete and validated.

---

## Goal

Integrate the frontend with the backend auth route:

- `POST /api/auth/login`

Using:

- `axios`
- a dedicated login page
- client-side auth state
- token persistence
- route protection for authenticated-only areas when needed later

---

## Backend Contract

### Endpoint
`POST /api/auth/login`

### Request body
```json
{
  "email": "mara@themargin.com",
  "password": "admin123"
}
```

### Success response
```json
{
  "accessToken": "<jwt>",
  "author": {
    "id": "<author-id>",
    "name": "Mara Voss",
    "email": "mara@themargin.com",
    "roles": ["admin"]
  }
}
```

### Error responses
- `401 Unauthorized` → invalid credentials
- `422 Validation Error` → invalid payload

---

## Current Frontend Scope

### Included in this phase
- install and configure `axios`
- create auth types
- create auth service for login
- create auth context/provider
- persist token and logged user
- create login page
- add login route
- add logout logic
- prepare protected-route structure if needed for next steps
- remove mock-based dependencies that block auth-first integration

### Explicitly excluded from this phase
- posts integration
- authors integration
- tags integration
- dashboard/admin CRUD
- refresh token flow
- role-based UI beyond storing roles
- full route protection for all future admin pages

---

## Architectural Decisions

### 1. Auth-first integration
The frontend should integrate login before any other backend module.

Reason:
- protected routes for create/update/delete depend on JWT
- axios interceptor/base config should be established first
- future modules will reuse the auth token automatically

### 2. Centralized auth state
Authentication state should live in a provider/context, not scattered across pages.

Recommended state:
- `accessToken`
- `author`
- `isAuthenticated`
- `isLoading`
- `login()`
- `logout()`

### 3. Token persistence
Persist auth data in `localStorage` for now.

Suggested keys:
- `the-margin.access-token`
- `the-margin.author`

### 4. Axios centralization
Use a single configured axios instance for all API calls.

This instance should:
- define `baseURL`
- send `Authorization: Bearer <token>` when token exists
- be reused by future modules

---

## Suggested Frontend Structure

```text
src/
├── guards/
│   └── ProtectedRoute.tsx
├── pages/
│   └── LoginPage.tsx
├── providers/
│   └── AuthProvider.tsx
├── services/
│   ├── api.ts
│   └── auth.service.ts
├── types/
│   └── auth.ts
└── ...
```

---

## Expected Types

### Login request
```ts
type LoginRequest = {
  email: string;
  password: string;
};
```

### Logged author
```ts
type AuthAuthor = {
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
  author: AuthAuthor;
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
- optional success redirect to `/`

Visual direction:
- keep the same editorial style already used in the project
- use `stone-*` and `amber-*`
- keep layout aligned with `max-w-* mx-auto px-6`
- avoid introducing a different visual language

---

## Validation Rules

Frontend validation should be minimal and aligned with backend expectations:

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

### Security rule
Do not expose whether the email or password was wrong.

---

## Mocks Removal Rule

Mocks can be removed if they interfere with the auth-first integration.

Important:
- removing mocks does **not** mean posts integration should start now
- if Home/Article depend on mocks, they may temporarily use placeholders or empty states until the posts module is implemented

Recommended temporary behavior:
- `HomePage` → show a “content integration pending” state
- `ArticlePage` → show a “post integration pending” state

This keeps the app buildable without prematurely implementing posts.

---

## Route Plan

### Public routes
- `/login`
- `/`
- `/about`

### Future protected routes
- admin pages to create/update/delete posts

For now, only the login route must be added.
Protected route infrastructure may be prepared, but no extra modules should be implemented yet.

---

## Completion Checklist

### Setup
- [x] `axios` installed
- [ ] API client file created
- [ ] auth types created
- [ ] auth service created

### State
- [ ] auth provider/context created
- [ ] token persistence implemented
- [ ] logout implemented
- [ ] auth bootstrap from storage implemented

### UI
- [ ] login page created
- [ ] login form validation implemented
- [ ] loading and error states implemented
- [ ] login route added to router

### App integration
- [ ] provider wired in app root
- [ ] header updated to reflect auth state if needed
- [ ] protected route helper prepared if needed

### Cleanup
- [ ] mock dependencies removed from auth flow
- [ ] app still builds successfully
- [ ] no posts/authors/tags integration started yet

---

## Non-Goals for This Phase

Do **not** implement now:

- fetching posts from `/api/posts`
- featured post integration
- article by slug integration
- author CRUD screens
- tag CRUD screens
- admin post editor
- refresh token mechanism
- role management UI

---

## Notes for the Next Step

Once login is fully complete and validated, the next module can start.

Recommended order after login:
1. posts listing (`GET /api/posts`)
2. featured post (`GET /api/posts/featured`)
3. article by slug (`GET /api/posts/slug/:slug`)
4. protected post CRUD using stored JWT

---

## Dev Credentials

From backend seed:

- `mara@themargin.com` / `admin123`
- `sam@themargin.com` / `admin123`
- `lena@themargin.com` / `admin123`

---

## Final Rule

Until every unchecked item in the login checklist is complete, this integration phase is still considered **login-only**.
No other backend module should be started before that.