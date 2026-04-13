# Tags CRUD Admin Phase

> This document tracks the **admin CRUD phase for tags** in `blog-client`.
>
> Scope for this phase is intentionally limited to:
>
> - listing tags in an admin screen
> - creating tags from the frontend
> - deleting tags from the frontend
> - protecting tag admin routes with the existing auth/admin flow
>
> This phase does **not** include:
>
> - tag editing
> - bulk actions
> - advanced search/filtering
> - role management
> - author management
> - broader dashboard work

---

## Goal

Provide a minimal but solid admin interface for tags so the team can:

- view existing tags
- create new tags
- delete tags
- keep tag data aligned with the backend
- support the protected post form flow with real tag management

---

## Backend Routes in Scope

### Public routes currently available
- `GET /api/tags`
- `GET /api/tags/:id`

### Write routes currently available
- `POST /api/tags`
- `DELETE /api/tags/:id`

### Required backend expectation for this phase
Write routes should be protected with:
- authentication
- `admin` role authorization

Recommended protection pattern:
- `authenticate`
- `requireRole("admin")`

---

## Frontend Scope

### Included in this phase
- create a protected admin tags list page
- create a protected admin tag creation page
- add delete action for tags
- extend the tag service with create/delete methods
- add admin routes for tags
- add navigation entry for tags in the admin area
- keep the current post form tag integration working

### Explicitly excluded from this phase
- edit tag page
- inline tag editing
- tag usage analytics
- tag search/autocomplete
- bulk delete
- pagination unless necessary
- author CRUD
- role CRUD

---

## Recommended Routes

### Admin routes
- `/admin/tags`
- `/admin/tags/new`

### Behavior
- `/admin/tags` shows the list of tags
- `/admin/tags/new` shows the create form
- after successful creation, redirect to `/admin/tags`
- after successful deletion, remain on `/admin/tags` and refresh/remove the row

---

## Expected Frontend Types

### Tag
```ts
type Tag = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};
```

### Create tag request
```ts
type CreateTagRequest = {
  name: string;
  slug?: string;
};
```

### Tag form values
```ts
type TagFormValues = {
  name: string;
  slug: string;
};
```

### Tag form errors
```ts
type TagFormErrors = Partial<Record<keyof TagFormValues, string>>;
```

---

## Service Layer Requirements

The frontend tag service should support:

- `listTags()`
- `getTagById(id)`
- `createTag(data)`
- `deleteTag(id)`

### Error mapping expectations
Map backend responses to friendly messages:

- `401` → `Authentication required.`
- `403` → `You do not have permission to perform this action.`
- `404` → `Tag not found.`
- `409` → `A tag with this slug already exists.`
- `422` → `Please review the tag fields and try again.`
- network error → `Unable to connect to the API.`

---

## UI Requirements

### ManageTagsPage
Should:
- load all tags
- show loading state
- show empty state
- show error state
- show create button
- show delete action
- confirm before delete
- show tag name and slug clearly

### CreateTagPage
Should:
- render a simple form
- include `name`
- include optional `slug`
- validate fields
- submit to API
- show loading/submitting state
- show API error state
- redirect after success

---

## Validation Rules

Frontend validation should stay aligned with backend expectations.

### Name
- required
- min length: 1
- max length: 50

### Slug
- optional
- if provided, must be kebab-case

### Important
- backend remains the source of truth
- frontend validation is only for UX

---

## Slug Rules

If the user provides a slug:
- it must be kebab-case

If the user leaves slug empty:
- backend may generate it from the name

Recommended regex:
```ts
/^[a-z0-9]+(?:-[a-z0-9]+)*$/
```

---

## UX Rules

### Manage page
- keep the same editorial/admin visual language already used in the project
- use `stone-*` and `amber-*`
- keep layout aligned with `max-w-* mx-auto px-6`
- use simple action buttons:
  - create
  - delete

### Create page
- keep the form minimal
- avoid overengineering
- use the same admin style as post create/edit pages

---

## Security Rules

### Route protection
All admin tag pages must require:
- authenticated user
- `admin` role

### Backend enforcement
Even if the frontend blocks access, the backend must remain the source of truth.

### Delete confirmation
Deletion should always require explicit confirmation in the UI.

---

## Suggested Frontend Structure

```text
src/
├── pages/
│   └── admin/
│       └── tags/
│           ├── ManageTagsPage.tsx
│           └── CreateTagPage.tsx
├── services/
│   └── tagService.ts
├── types/
│   └── tag.ts
└── ...
```

---

## Suggested Implementation Order

1. protect backend write routes for tags
2. extend frontend tag service with create/delete
3. create `/admin/tags`
4. create `/admin/tags/new`
5. wire routes into `App.tsx`
6. add admin navigation link
7. validate create/delete flow end-to-end

---

## Completion Checklist

### Backend
- [ ] `POST /api/tags` protected with auth + admin role
- [ ] `DELETE /api/tags/:id` protected with auth + admin role

### Frontend service
- [ ] `createTag()` added
- [ ] `deleteTag()` added
- [ ] error mapping updated for write operations

### Admin UI
- [ ] `ManageTagsPage` created
- [ ] `CreateTagPage` created
- [ ] loading state added
- [ ] empty state added
- [ ] error state added
- [ ] delete confirmation added

### Routing
- [ ] `/admin/tags` route added
- [ ] `/admin/tags/new` route added
- [ ] admin navigation updated

### Validation
- [ ] name validation added
- [ ] slug validation added
- [ ] duplicate slug conflict handled

### Cleanup
- [ ] tag selection in post forms still works
- [ ] protected post CRUD still works
- [ ] no unrelated admin modules started

---

## Non-Goals for This Phase

Do **not** implement now:
- tag edit page
- inline editing
- tag merge
- tag usage counts
- tag search
- bulk actions
- author management UI
- role management UI
- dashboard analytics

---

## Recommended Next Step After This Phase

Once tag CRUD is complete, the next logical step should be one of:

1. author CRUD admin UI
2. shared validation helpers for admin forms
3. admin feedback improvements:
   - toasts
   - success banners
   - reusable confirmation patterns

---

## Final Rule

Until every unchecked item in this document is complete, this phase is still considered **tag CRUD admin only**.

Do not expand the scope into unrelated admin modules before finishing this phase.