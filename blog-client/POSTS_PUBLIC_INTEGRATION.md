# Public Posts Integration Progress

> This document tracks the frontend integration of the **public posts module**
> with `blog-api`, after the login phase was completed.
>
> Scope for this phase is intentionally limited to:
>
> - `GET /api/posts`
> - `GET /api/posts/featured`
> - `GET /api/posts/slug/:slug`
>
> Do not start protected post CRUD, authors, or tags management in this phase.

---

## Goal

Replace the temporary placeholder pages with real public content loaded from the backend.

This phase should restore the editorial reading experience while keeping the
admin/protected flows out of scope.

---

## Backend Routes in Scope

### 1. List posts
`GET /api/posts`

#### Supported query params
- `category`
- `tag`
- `search`
- `published`
- `page`
- `limit`

#### Response shape
```json
{
  "data": [
    {
      "id": "post-id",
      "slug": "the-quiet-internet",
      "title": "The Quiet Internet",
      "subtitle": "A meditation on what we lost when everything became loud",
      "excerpt": "There was a time when logging on felt like entering a library...",
      "category": "Essay",
      "readTime": "7 min",
      "featured": true,
      "published": true,
      "createdAt": "2026-04-10T00:00:00.000Z",
      "updatedAt": "2026-04-10T00:00:00.000Z",
      "authorId": "author-mara",
      "author": {
        "id": "author-mara",
        "name": "Mara Voss",
        "initials": "MV",
        "bio": "Contributing editor..."
      },
      "tags": [
        {
          "id": "tag-1",
          "name": "culture",
          "slug": "culture"
        }
      ]
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 2. Featured post
`GET /api/posts/featured`

#### Response shape
Single `PostSummary` object.

---

### 3. Post by slug
`GET /api/posts/slug/:slug`

#### Response shape
Single full `Post` object including `body`.

---

## Frontend Scope

### Included in this phase
- create posts service using the shared axios client
- fetch featured post from API
- fetch paginated public posts from API
- fetch article by slug from API
- restore `HomePage`
- restore `ArticlePage`
- keep login/auth integration intact
- keep public pages public
- normalize backend dates for UI display

### Explicitly excluded from this phase
- create post
- update post
- delete post
- admin dashboard
- author CRUD
- tag CRUD
- role-based UI
- protected editor screens

---

## Architectural Rules

### 1. Reuse the shared axios client
All requests must use the existing centralized API client.

Do not create a second HTTP client for posts.

### 2. Keep services thin
The posts service should:
- call the API
- pass query params
- normalize response data if needed
- map API errors to user-friendly messages when appropriate

Business/UI decisions should stay in pages/components.

### 3. Keep pages responsible for orchestration
- `HomePage` should orchestrate list + featured loading
- `ArticlePage` should orchestrate slug-based loading
- presentational components should remain prop-driven

### 4. Preserve current visual language
Use the same editorial style already established:
- `stone-*`
- `amber-*`
- serif for editorial content
- `max-w-5xl mx-auto px-6` layout alignment

---

## Suggested Frontend Files

```text
src/
├── services/
│   └── postService.ts
├── types/
│   └── post.ts
├── pages/
│   ├── HomePage.tsx
│   └── ArticlePage.tsx
└── components/
    ├── FeaturedPost.tsx
    └── PostCard.tsx
```

---

## Expected Frontend Types

### Post author
```ts
type PostAuthor = {
  id: string;
  name: string;
  initials: string;
  bio: string | null;
};
```

### Post tag
```ts
type PostTag = {
  id: string;
  name: string;
  slug: string;
};
```

### Post summary
```ts
type PostSummary = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: string;
  readTime: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: PostAuthor;
  tags: PostTag[];
};
```

### Full post
```ts
type Post = PostSummary & {
  body: string;
};
```

### Paginated response
```ts
type PaginatedPostsResponse = {
  data: PostSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
```

---

## UI Behavior Requirements

### HomePage
Should:
- load featured post
- load public posts list
- support category filter
- support search filter
- keep the “Long reads” bar
- navigate to `/post/:slug` on click
- show loading state
- show empty state
- show API error state

### ArticlePage
Should:
- read `slug` from route params
- fetch the post by slug
- render title, subtitle, metadata, author, body, tags
- show loading state
- show not found state
- show API error state

---

## Date Handling Rule

The backend returns ISO dates in `createdAt` and `updatedAt`.

The previous mock UI used a `date` field like:
- `April 8, 2026`

To preserve the current design, the frontend should normalize API dates into a
display-friendly string.

Recommended approach:
- derive `date` from `createdAt`
- use `Intl.DateTimeFormat` or `date-fns`
- keep formatting centralized if reused

Example:
```ts
new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
}).format(new Date(createdAt));
```

---

## Error Handling Rules

### HomePage
Map failures to a friendly message such as:
- `Unable to load posts right now.`

### ArticlePage
Map failures to:
- `We couldn't load this article right now.`
- if backend returns `404`, show the existing “Article not found” state

### Important
Do not expose raw backend/internal errors directly in the UI.

---

## Loading State Rules

### HomePage
Recommended:
- show a subtle loading message or skeleton while featured/list requests are in progress
- avoid rendering broken layout placeholders

### ArticlePage
Recommended:
- show centered loading state with editorial styling
- keep layout stable while loading

---

## Search and Filter Rules

### Category filter
Frontend categories should remain:
- `All`
- `Essay`
- `Practice`
- `Work`
- `Tools`

Behavior:
- `All` means no `category` query param
- any other category should be sent as `category=<value>`

### Search
- send `search=<query>` only when non-empty after trim
- debounce is optional in this phase
- immediate fetch on change is acceptable if implementation stays simple

### Published
Public pages should request only published content.
If omitted, backend already defaults to `true`, but explicitly sending
`published=true` is acceptable.

---

## Navigation Rules

- `HomePage` links to `ArticlePage` using `slug`
- `ArticlePage` back link returns to archive
- login/auth state in header must remain unchanged from the previous phase

---

## Completion Checklist

### Service layer
- [ ] posts service created
- [ ] list posts request implemented
- [ ] featured post request implemented
- [ ] get post by slug request implemented
- [ ] date normalization implemented

### Home page
- [ ] placeholder removed
- [ ] featured post rendered from API
- [ ] posts list rendered from API
- [ ] category filter wired to API
- [ ] search wired to API
- [ ] loading state added
- [ ] empty state added
- [ ] error state added

### Article page
- [ ] placeholder removed
- [ ] slug-based fetch implemented
- [ ] loading state added
- [ ] not found state added
- [ ] error state added
- [ ] tags rendered from API
- [ ] body rendered from API

### Cleanup
- [ ] no dependency on removed mocks
- [ ] login flow still works
- [ ] no CRUD started
- [ ] app remains ready for next protected module

---

## Non-Goals for This Phase

Do **not** implement now:
- `POST /api/posts`
- `PATCH /api/posts/:id`
- `DELETE /api/posts/:id`
- admin post editor
- author management
- tag management
- dashboard pages
- role-based route restrictions for content pages

---

## Recommended Next Step After This Phase

Once public posts integration is complete and validated, the next step should be:

1. protected post CRUD using stored JWT
2. admin-only route protection in the frontend
3. create/edit/delete post screens

---

## Final Rule

Until every unchecked item in this document is complete, this phase is still
considered **public posts only**.

Do not start protected CRUD or other backend modules before finishing this scope.