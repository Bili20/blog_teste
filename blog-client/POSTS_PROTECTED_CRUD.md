# Protected Posts CRUD Progress

> This document tracks the frontend integration of the **protected posts CRUD**
> with `blog-api`.
>
> Scope for this phase is intentionally limited to:
>
> - `POST /api/posts`
> - `PATCH /api/posts/:id`
> - `DELETE /api/posts/:id`
>
> All these routes require:
>
> - valid JWT
> - `admin` role
>
> Do not start authors CRUD, tags CRUD, or role management in this phase.

---

## Goal

Enable authenticated admins to manage posts from the frontend using the JWT
session already implemented in the login phase.

This phase should add the minimum admin flow necessary to:

- create a post
- edit a post
- delete a post
- protect admin-only screens in the frontend

---

## Backend Routes in Scope

### 1. Create post
`POST /api/posts`

#### Auth requirements
- `Authorization: Bearer <token>`
- role: `admin`

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
- role: `admin`

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
- role: `admin`

#### Success response
- `204 No Content`

---

## Frontend Scope

### Included in this phase
- add protected admin routes
- create post form page
- edit post form page
- create posts management page
- add create/update/delete methods to the posts service
- reuse stored JWT automatically through the shared axios client
- restrict admin pages to authenticated users
- restrict admin pages to users with `admin` role
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
non-admin users from accessing admin screens.

Recommended rule:
- authenticated but non-admin users should be redirected away from admin routes

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
All admin pages must require a logged-in user.

### Authorization
All admin pages must require the `admin` role.

### Recommended frontend behavior
- unauthenticated user → redirect to `/login`
- authenticated non-admin user → redirect to `/` or show access denied
- authenticated admin user → allow access

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

Recommended admin routes:

- `/admin/posts`
- `/admin/posts/new`
- `/admin/posts/:id/edit`

Behavior:
- after create → redirect to `/admin/posts`
- after update → redirect to `/admin/posts`
- after delete → stay on `/admin/posts` and refresh list

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
- [ ] create post method added
- [ ] update post method added
- [ ] delete post method added
- [ ] protected API error mapping added

### Route protection
- [ ] admin route guard created
- [ ] admin routes added to router
- [ ] non-admin access blocked in frontend

### Management page
- [ ] posts management page created
- [ ] posts list rendered
- [ ] create button added
- [ ] edit action added
- [ ] delete action added
- [ ] delete confirmation added
- [ ] loading state added
- [ ] empty state added
- [ ] error state added

### Create page
- [ ] create page created
- [ ] form rendered
- [ ] validation added
- [ ] submit to API implemented
- [ ] success redirect implemented
- [ ] error state added

### Edit page
- [ ] edit page created
- [ ] existing post loaded
- [ ] form prefilled
- [ ] update request implemented
- [ ] success redirect implemented
- [ ] error state added

### Cleanup
- [ ] login flow still works
- [ ] public posts pages still work
- [ ] no authors CRUD started
- [ ] no tags CRUD started

---

## Non-Goals for This Phase

Do **not** implement now:
- authors CRUD
- tags CRUD
- role management
- media upload
- markdown editor
- autosave
- drafts workflow beyond `published`
- audit log UI
- bulk delete
- pagination for admin list unless necessary

---

## Recommended Next Step After This Phase

Once protected posts CRUD is complete and validated, the next step should be one of:

1. authors integration
2. tags integration
3. admin UX refinements:
   - better selects
   - tag picker
   - richer validation
   - improved error handling

---

## Final Rule

Until every unchecked item in this document is complete, this phase is still
considered **protected posts CRUD only**.

Do not start authors or tags modules before finishing this scope.