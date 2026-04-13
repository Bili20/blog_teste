# Tags Integration Progress

> This document tracks the frontend integration of the **tags module** with `blog-api`.
>
> Scope for this phase is intentionally limited to:
>
> - `GET /api/tags`
> - using real tags in protected post forms
> - replacing manual tag slug text input with a real tag selection UI
>
> Do not start tags CRUD screens, authors management screens, or role management in this phase.

---

## Goal

Replace the temporary comma-separated `tagSlugs` text field in the protected post forms with a real tag selection flow backed by the API.

This phase should improve the admin post experience while keeping the scope focused on **tag consumption**, not tag administration.

---

## Backend Routes in Scope

### 1. List tags
`GET /api/tags`

#### Response shape
```json
[
  {
    "id": "tag-id",
    "name": "culture",
    "slug": "culture",
    "createdAt": "2026-04-10T00:00:00.000Z"
  }
]
```

### 2. Get tag by id
`GET /api/tags/:id`

#### Response shape
```json
{
  "id": "tag-id",
  "name": "culture",
  "slug": "culture",
  "createdAt": "2026-04-10T00:00:00.000Z"
}
```

---

## Frontend Scope

### Included in this phase
- create frontend tag types
- create frontend tag service
- fetch tags from the API
- use real tags in `CreatePostPage`
- use real tags in `EditPostPage`
- replace comma-separated tag slug input with a tag selection UI
- keep protected post CRUD working
- keep current-user author flow intact

### Explicitly excluded from this phase
- create tag screen
- edit tag screen
- delete tag screen
- tag management dashboard
- author management UI
- role management UI
- advanced tag search/autocomplete
- nested tag groups
- bulk tag operations

---

## Architectural Rules

### 1. Reuse the shared API client
All tag requests must use the existing centralized API client.

Do not create a second HTTP client.

### 2. Keep tags as a support module
In this phase, tags exist to support post creation and editing.

That means:
- tags are fetched
- tags are displayed
- tags are selected
- tags are submitted as `tagSlugs`

But:
- tags are not managed yet

### 3. Keep post forms as the orchestration layer
The post form pages should:
- load available tags
- manage selected tags
- convert selected tags into `tagSlugs`
- submit the final payload

The tag service should only:
- fetch tags
- normalize errors

### 4. Preserve current admin UX
The current admin post flow should remain intact:
- current logged-in user is the author for create
- edit page still supports existing post loading
- protected admin routes remain unchanged

---

## Suggested Frontend Files

```text
src/
├── services/
│   └── tagService.ts
├── types/
│   └── tag.ts
├── pages/
│   └── admin/
│       ├── CreatePostPage.tsx
│       └── EditPostPage.tsx
└── ...
```

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

### Tag summary
If needed, the same `Tag` shape can be reused directly.

### Post form selected tags
Recommended internal representation:
```ts
type SelectedTagSlugs = string[];
```

---

## UI Requirements

### CreatePostPage
Should:
- load available tags from the API
- show loading state for tags
- show selected tags clearly
- allow selecting/unselecting tags
- submit selected tag slugs in `tagSlugs`

### EditPostPage
Should:
- load available tags from the API
- preselect tags already attached to the post
- allow changing selected tags
- submit updated `tagSlugs`

### Tag selection UI
Recommended simple options for this phase:
- checkbox list
- grouped checkbox grid
- button/toggle chips

Preferred direction:
- simple checkbox or chip-based selection
- no autocomplete yet
- no async search yet

---

## Data Mapping Rule

The backend expects:
```json
{
  "tagSlugs": ["culture", "technology", "attention"]
}
```

The frontend may display:
- tag `name`
- tag `slug`
- or both

But the submitted payload must always use:
- `tag.slug`

---

## Validation Rules

Frontend validation should remain lightweight.

### Required behavior
- selected tags are optional
- if tags are selected, all submitted values must be valid slugs from the loaded tag list
- no duplicate slugs should be submitted

### Important
The backend remains the source of truth.

---

## Error Handling Rules

### Tag loading errors
Map failures to a friendly message such as:
- `Unable to load tags right now.`

### Form submission errors
If tag loading fails:
- the form may still render
- but tag selection should be disabled or clearly unavailable

If tag selection is unavailable:
- the user should still understand why
- the rest of the form should remain usable if possible

---

## Loading State Rules

### CreatePostPage
- show a subtle loading state while tags are being fetched
- do not block the whole page longer than necessary

### EditPostPage
- tags loading can happen alongside post loading
- if post loads before tags, selected tag state should still reconcile correctly once tags arrive

---

## Selection Rules

### Recommended internal behavior
- store selected tag slugs in state
- derive checked state from `selectedTagSlugs.includes(tag.slug)`

### Toggle behavior
- if selected → remove slug
- if not selected → add slug

### Submission behavior
- send `tagSlugs` as a clean array
- no empty strings
- no duplicates

---

## UX Notes

### Good enough for this phase
- checkbox list
- chip/toggle buttons
- simple two-column layout
- selected count

### Not needed yet
- drag-and-drop
- autocomplete
- tag creation inline
- tag filtering
- tag categories

---

## Completion Checklist

### Service layer
- [ ] tag service created
- [ ] list tags request implemented
- [ ] get tag by id request implemented if needed
- [ ] tag error mapping implemented

### Types
- [ ] frontend tag type created
- [ ] tag selection state shape defined

### Create post page
- [ ] tags loaded from API
- [ ] manual tag slug input removed
- [ ] tag selection UI added
- [ ] selected tags submitted as `tagSlugs`
- [ ] loading state added
- [ ] error state added

### Edit post page
- [ ] tags loaded from API
- [ ] existing post tags preselected
- [ ] manual tag slug input removed
- [ ] tag selection UI added
- [ ] updated tags submitted as `tagSlugs`
- [ ] loading state added
- [ ] error state added

### Cleanup
- [ ] protected post CRUD still works
- [ ] current-user author flow still works
- [ ] no tag CRUD started
- [ ] no author CRUD UI started

---

## Non-Goals for This Phase

Do **not** implement now:
- `POST /api/tags`
- `DELETE /api/tags/:id`
- tag management page
- tag creation modal
- tag editing UI
- author management UI
- role management UI
- advanced tag search

---

## Recommended Next Step After This Phase

Once tags are integrated into the post forms, the next logical step should be one of:

1. tag CRUD/admin management
2. author management UI
3. admin UX refinements:
   - better validation
   - reusable post form component
   - success toasts
   - improved loading states

---

## Final Rule

Until every unchecked item in this document is complete, this phase is still considered **tags integration only**.

Do not start tag CRUD or author management UI before finishing this scope.