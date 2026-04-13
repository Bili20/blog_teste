# Protected Posts CRUD Progress

> This document tracks the frontend integration of the **protected posts CRUD**
> with `blog-api`.
>
> Scope for this phase is intentionally limited to:
>
> - `POST /api/posts`
> - `PATCH /api/posts/:id`
> - `DELETE /api/posts/:id`
> - role-based post listing behavior in the admin area
>
> These routes require authentication and are role-sensitive:
>
> - `admin` can manage any post
> - `author` can create posts and manage only their own posts
>
> Do not start authors CRUD, tags CRUD, or role management in this phase.

---

## Goal

Enable authenticated users with content permissions to manage posts from the
frontend using the JWT session already implemented in the login phase.

This phase should add the minimum protected flow necessary to:

- create a post
- edit a post
- delete a post
- protect post management screens in the frontend
- adapt the post listing UI to the current user's role

---

## Backend Routes in Scope

### 1. Create post
`POST /api/posts`

#### Auth requirements
- `Authorization: Bearer <token>`
- role: `admin` or `author`

#### Request body
```json
{
  "title": "The Quiet Internet",
  "subtitle": "A meditation on what we lost when everything became loud",
  "excerpt": "There was a time when logging on felt like entering a library...",
  "body": "Full article body...",
  "category": "Essay",
  "readTime": "7 min",
  "slug": "the-quiet-internet",
  "featured": true,
  "published": true,
  "authorId": "author-mara",
  "tagSlugs": ["culture", "technology", "attention"]
}
```

#### Success response
- `201 Created`
- returns the created full `Post`

---

### 2. Update post
`PATCH /api/posts/:id`

#### Auth requirements
- `Authorization: Bearer <token>`
- role: `admin` or `author`
- `author` may update only their own posts

#### Request body
Any subset of the create payload.

#### Success response
- `200 OK`
- returns the updated full `Post`

---

### 3. Delete post
`DELETE /api/posts/:id`

#### Auth requirements
- `Authorization: Bearer <token>`
- role: `admin` or `author`
- `author` may delete only their own posts

#### Success response
- `204 No Content`

---

## Frontend Scope

### Included in this phase
- add protected post routes
- create post form page
- edit post form page
- create posts management page
- add create/update/delete methods to the posts service
- reuse stored JWT automatically through the shared axios client
- restrict protected post pages to authenticated users
- support role-based access for `admin` and `author`
- support ownership-aware listing behavior for `author`
- support delete action from the management screen

### Explicitly excluded from this phase
- authors CRUD
- tags CRUD
- role management UI
- dashboard analytics
- rich text editor
- image upload
- refresh token flow
- optimistic updates
- bulk actions

---

## Architectural Rules

### 1. Reuse the shared auth and API infrastructure
Protected CRUD must reuse what already exists:

- shared axios client
- auth provider
- stored JWT
- protected route pattern

Do not create a second auth flow.

### 2. Keep service responsibilities clear
The posts service should:
- call the protected endpoints
- send payloads
- map API errors to user-friendly messages

Pages should:
- manage form state
- manage loading/submitting state
- navigate after success
- render validation and API feedback

### 3. Keep admin pages separate from public pages
Recommended separation:

- public pages stay under `src/pages/`
- admin pages live under `src/pages/admin/`

This keeps the public reading experience isolated from admin tooling.

### 4. Role checks must happen in the frontend too
The backend remains the source of truth, but the frontend should also prevent
unauthorized users from accessing protected post screens.

Recommended rule:
- authenticated `admin` users can access all protected post screens
- authenticated `author` users can access protected post screens for content work
- users without `admin` or `author` should be redirected away

---

## Suggested Frontend Files

```text
src/
├── pages/
│   └── admin/
│       ├── CreatePostPage.tsx
│       ├── EditPostPage.tsx
│       └── ManagePostsPage.tsx
├── guards/
│   ├── ProtectedRoute.tsx
│   └── AdminRoute.tsx
├── services/
│   └── postService.ts
├── types/
│   └── post.ts
└── ...
```

---

## Expected Frontend Types

### Post form input
```ts
type PostFormInput = {
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
  category: "Essay" | "Practice" | "Work" | "Tools";
  readTime: string;
  slug?: string;
  featured?: boolean;
  published?: boolean;
  authorId: string;
  tagSlugs?: string[];
};
```

### Update post input
```ts
type UpdatePostInput = Partial<PostFormInput>;
```

### Category options
```ts
type PostCategory = "Essay" | "Practice" | "Work" | "Tools";
```

---

## UI Requirements

### ManagePostsPage
Should:
- list posts
- show title, category, date, author
- provide edit action
- provide delete action
- provide link/button to create a new post
- show loading state
- show empty state
- show delete confirmation
- show API error state
- adapt visible content based on the current user's role
- show all posts for `admin`
- show only owned posts for `author`

### CreatePostPage
Should:
- render a full post form
- validate required fields
- submit to `POST /api/posts`
- show submitting state
- show API error state
- redirect after success

### EditPostPage
Should:
- load the existing post
- prefill the form
- submit to `PATCH /api/posts/:id`
- show submitting state
- show API error state
- redirect after success

---

## Form Fields Required

The form should include at least:

- `title`
- `subtitle`
- `excerpt`
- `body`
- `category`
- `readTime`
- `slug`
- `featured`
- `published`
- `authorId`
- `tagSlugs`

### Notes
- `slug` may be optional in the UI, since the backend can generate it from title
- `tagSlugs` can start as a comma-separated input in this phase
- `authorId` can initially be a plain text input or default to the logged-in author later
- no need for advanced tag picker in this phase

---

## Validation Rules

Frontend validation should stay aligned with backend Zod rules:

- `title`: min 3, max 200
- `subtitle`: min 3, max 300
- `excerpt`: min 10, max 600
- `body`: min 20
- `category`: one of `Essay | Practice | Work | Tools`
- `readTime`: min 1, max 20
- `slug`: kebab-case if provided
- `authorId`: required
- `tagSlugs`: array of strings

Important:
- backend remains the source of truth
- frontend validation is for UX only

---

## Auth and Authorization Rules

### Authentication
All protected post pages must require a logged-in user.

### Authorization
Protected post pages must allow:
- `admin`
- `author`

### Ownership rule
For post listing and actions:
- `admin` can see and manage all posts
- `author` can see and manage only posts where `post.authorId === currentUser.id`

### Recommended frontend behavior
- unauthenticated user → redirect to `/login`
- authenticated user without `admin` or `author` → redirect to `/` or show access denied
- authenticated `admin` user → allow full access
- authenticated `author` user → allow access with ownership restrictions

### Important
Even if the frontend blocks access, the backend still enforces the real rule.
Frontend checks are only for UX and navigation safety.

---

## Error Handling Rules

### Create/update errors
Map backend responses to friendly messages such as:

- `401` → `Your session has expired. Please sign in again.`
- `403` → `You do not have permission to perform this action.`
- `409` → `A post with this slug already exists.`
- `422` → `Please review the form fields.`
- network/server error → `Unable to save the post right now.`

### Delete errors
Map to:
- `401` → session expired
- `403` → no permission
- `404` → post no longer exists
- generic → `Unable to delete the post right now.`

### Security rule
Do not expose raw backend/internal errors directly in the UI.

---

## Navigation Rules

Recommended protected post routes:

- `/admin/posts`
- `/admin/posts/new`
- `/admin/posts/:id/edit`

Behavior:
- after create → redirect to `/admin/posts`
- after update → redirect to `/admin/posts`
- after delete → stay on `/admin/posts` and refresh list
- listing behavior on `/admin/posts` depends on role:
  - `admin` sees all posts
  - `author` sees only owned posts

---

## Loading and Submission Rules

### Management page
- show loading while fetching posts
- disable delete button while deleting a specific row if possible

### Form pages
- disable submit while saving
- prevent duplicate submissions
- keep form values visible on API error
- show inline/global error feedback

---

## Reuse Rules

### Reuse existing components where possible
- `Button`
- `Input`
- `Label`
- `Textarea`
- `Select` if already available and stable
- existing editorial layout classes

### Avoid overengineering in this phase
Do not introduce:
- form builders
- generic admin frameworks
- complex state libraries
- WYSIWYG editors

A straightforward implementation is preferred.

---

## Completion Checklist

### Service layer
- [x] create post method added
- [x] update post method added
- [x] delete post method added
- [x] protected API error mapping added

### Route protection
- [x] protected post route guard created (`ContentRoute` — allows `admin` + `author`)
- [x] protected post routes added to router
- [x] users without `admin` or `author` blocked in frontend
- [x] role-based access for `admin` and `author` implemented

### Management page
- [x] posts management page created
- [x] posts list rendered
- [x] create button added
- [x] edit action added
- [x] delete action added
- [x] delete confirmation added
- [x] loading state added
- [x] empty state added
- [x] error state added
- [x] `admin` sees all posts (no `published` filter — drafts included)
- [x] `author` sees only owned posts
- [x] ownership-aware actions rendered correctly

### Create page
- [x] create page created
- [x] form rendered
- [x] validation added
- [x] submit to API implemented
- [x] success redirect implemented
- [x] error state added

### Edit page
- [x] edit page created
- [x] existing post loaded
- [x] form prefilled
- [x] update request implemented (`authorId` locked for `author` role)
- [x] success redirect implemented
- [x] error state added

### Cleanup
- [x] login flow still works
- [x] public posts pages still work
- [x] authors CRUD completed (subsequent phase)
- [x] tags CRUD completed (subsequent phase)

---

## Non-Goals for This Phase

Items that were out of scope and remain pending:
- role management UI
- media upload
- markdown editor
- autosave
- audit log UI
- bulk delete
- cross-author moderation UI for non-admin users
- pagination for admin list

Items completed in subsequent phases:
- ~~authors CRUD~~ → done (`/admin/authors`)
- ~~tags CRUD~~ → done (`/admin/tags`)

---

## Phase Status

**✅ This phase is complete.**

All protected posts CRUD functionality is implemented and working for both
`admin` and `author` roles. Authors and tags CRUD have also been completed
in subsequent phases.

## Pending UX refinements (future phases)

- better author/tag selects (replace plain inputs)
- richer inline validation feedback
- pagination for the admin post list
- bulk delete actions