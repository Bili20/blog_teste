# Post Form Refactor Progress

> This document tracks the refactor of the protected admin post form flow in `blog-client`.
>
> Scope for this phase is intentionally limited to:
>
> - extracting shared create/edit post form UI
> - extracting shared post form state and validation behavior
> - reducing duplication between `CreatePostPage` and `EditPostPage`
> - preserving the current protected CRUD behavior
>
> Do not start author management UI, tag CRUD UI, or broader admin dashboard work in this phase.

---

## Goal

Refactor the admin post creation and editing flow so both pages share a single reusable form architecture.

The current implementation already works, but it contains duplicated logic across:

- field rendering
- validation
- tag selection UI
- category selection UI
- metadata layout
- submit button states
- error rendering

This phase should improve maintainability without changing the functional behavior of the protected post CRUD flow.

---

## Current Problem

At the moment, both pages contain overlapping logic:

- `CreatePostPage.tsx`
- `EditPostPage.tsx`

### Duplicated concerns
- title/subtitle/excerpt/body fields
- category select
- read time input
- slug input
- featured/published toggles
- tag selection UI
- validation rules
- API error rendering
- submit/cancel actions
- admin layout structure

### Why this is a problem
- harder to maintain
- easier to introduce inconsistent behavior
- harder to evolve validation
- harder to improve UX in one place
- harder to add future fields

---

## Refactor Goal

Move the shared post form behavior into reusable building blocks while keeping page-level orchestration separate.

### Desired split

#### Page responsibilities
Pages should handle:
- route params
- auth checks
- loading existing post data
- deciding whether the mode is `create` or `edit`
- calling the correct API action
- redirecting after success

#### Shared form responsibilities
The shared form should handle:
- rendering all common fields
- rendering tag selection
- rendering category selection
- rendering metadata section
- rendering validation messages
- rendering submit/cancel actions
- exposing a clean submit callback

---

## Recommended Architecture

```text
src/
├── components/
│   └── admin/
│       ├── PostForm.tsx
│       ├── PostFormFields.tsx              (optional)
│       ├── PostMetadataSection.tsx         (optional)
│       └── PostTagSelector.tsx             (optional)
├── pages/
│   └── admin/
│       ├── CreatePostPage.tsx
│       └── EditPostPage.tsx
├── types/
│   └── post.ts
└── ...
```

A minimal version can start with only:

- `PostForm.tsx`

and split further only if needed.

---

## Recommended Shared Types

### Shared form values
```ts
type PostFormValues = {
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
  category: PostCategory;
  readTime: string;
  slug: string;
  featured: boolean;
  published: boolean;
  authorId: string;
  tagSlugs: string[];
};
```

### Shared form errors
```ts
type PostFormErrors = Partial<Record<keyof PostFormValues, string>>;
```

### Shared form mode
```ts
type PostFormMode = "create" | "edit";
```

### Shared form props
```ts
type PostFormProps = {
  mode: PostFormMode;
  values: PostFormValues;
  errors: PostFormErrors;
  isSubmitting: boolean;
  apiErrorMessage: string | null;
  submitLabel: string;
  cancelHref: string;
  authorDisplayName: string;
  tagOptions: Tag[];
  isLoadingTags: boolean;
  tagsErrorMessage: string | null;
  authorOptions?: Author[];
  isLoadingAuthors?: boolean;
  onChange: <K extends keyof PostFormValues>(
    fieldName: K,
    fieldValue: PostFormValues[K],
  ) => void;
  onToggleTag: (tagSlug: string, isChecked?: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};
```

---

## Shared Form Rules

### 1. The form must stay dumb
The shared form should not:
- call APIs directly
- navigate directly
- decide whether to create or update
- know route params
- know auth rules

It should only:
- render
- emit changes
- emit submit

### 2. Pages remain orchestrators
`CreatePostPage` and `EditPostPage` should still own:
- data loading
- auth checks
- payload construction
- API calls
- redirects

### 3. Validation can be shared
Validation logic may be:
- kept in a shared helper
- or kept in pages initially if extraction becomes too large

Preferred direction:
- extract validation into a shared helper once the form component is stable

---

## Suggested Refactor Steps

### Step 1
Extract the full shared JSX into `PostForm.tsx`.

### Step 2
Pass all current state and handlers from:
- `CreatePostPage`
- `EditPostPage`

### Step 3
Keep create/edit-specific logic in the pages:
- create uses current logged-in author
- edit loads existing post and supports author reassignment

### Step 4
Optionally extract helpers:
- `validatePostForm`
- `buildCreatePostPayload`
- `buildUpdatePostPayload`

---

## Shared UI Sections

The reusable form should contain these sections:

### Editorial content section
- title
- subtitle
- excerpt
- body

### Metadata section
- category
- read time
- slug
- author
- tags
- featured
- published

### Feedback section
- field-level validation errors
- API error message
- loading states for tags/authors

### Actions section
- submit button
- cancel link/button

---

## Create vs Edit Differences

### Create mode
- author is the current logged-in user
- author field is read-only/informational
- submit action calls `createPost`
- success redirects to `/admin/posts`

### Edit mode
- author can be reassigned from real author options
- existing post values are prefilled
- submit action calls `updatePost`
- success redirects to `/admin/posts`

### Important rule
The shared form should support both modes through props, not through internal branching tied to route logic.

---

## Tag Selection Rules

The tag selector should remain reusable.

### Shared behavior
- receives available tags
- receives selected tag slugs
- toggles selection
- shows loading state
- shows error state
- shows empty state

### Submission rule
The form should always submit:
```ts
tagSlugs: string[]
```

Never:
- tag names
- tag ids
- comma-separated strings

---

## Author Field Rules

### Create mode
- display current user name
- do not allow changing author
- still submit `authorId` from the authenticated user

### Edit mode
- display author select
- allow changing author
- submit selected `authorId`

This difference can be handled by props such as:
- `authorDisplayName`
- `authorOptions`
- `isAuthorEditable`

---

## Validation Rules

The refactor must preserve the current validation behavior:

- title: min 3
- subtitle: min 3
- excerpt: min 10
- body: min 20
- readTime: required
- slug: kebab-case if provided
- authorId: required
- category: valid enum value

### Important
Do not weaken validation during the refactor.

---

## UX Rules

The refactor should not change the current UX negatively.

### Must preserve
- current editorial visual style
- current admin layout
- current loading states
- current error states
- current submit button disabled behavior
- current cancel navigation

### Nice improvements allowed
- cleaner field grouping
- more consistent spacing
- more consistent error rendering
- more reusable checkbox/tag rendering

---

## Completion Checklist

### Shared architecture
- [ ] `PostForm` component created
- [ ] duplicated JSX removed from `CreatePostPage`
- [ ] duplicated JSX removed from `EditPostPage`
- [ ] create/edit pages reduced to orchestration logic

### Behavior preservation
- [ ] create flow still works
- [ ] edit flow still works
- [ ] tag selection still works
- [ ] author handling still works
- [ ] validation still works
- [ ] submit loading state still works
- [ ] API error rendering still works

### Cleanup
- [ ] no duplicated field rendering remains
- [ ] no duplicated metadata section remains
- [ ] no duplicated tag selection UI remains
- [ ] code is easier to extend for future fields

---

## Non-Goals for This Phase

Do **not** implement now:
- author CRUD UI
- tag CRUD UI
- rich text editor
- autosave
- markdown preview
- image upload
- form library migration
- global admin layout refactor
- toast system migration

---

## Recommended Next Step After This Refactor

Once the shared post form is stable, the next best step is one of:

1. extract shared validation helpers
2. add success toasts / better admin feedback
3. start author management UI
4. start tag management UI

---

## Final Rule

Until every unchecked item in this document is complete, this phase is still considered **post form refactor only**.

Do not expand the scope into unrelated admin modules before finishing the shared form architecture.