# Frontend Context Index

This directory keeps only the **essential frontend context documents** that describe
the current project state, rules, and architectural expectations.

## Purpose

Use these files to quickly understand:

- how frontend authentication works
- how protected post management works
- what rules the current implementation must follow

This folder is **not** meant to keep old phase-by-phase history once that history
is no longer useful.

---

## Essential Documents

### `LOGIN_INTEGRATION.md`
Primary reference for the current frontend authentication model.

Covers:
- cookie-based login flow
- session bootstrap
- `/auth/me`, `/auth/refresh`, `/auth/logout`
- auth provider responsibilities
- protected route expectations
- frontend auth security notes

Use this when working on:
- login
- logout
- session refresh
- route protection
- auth state

---

### `POSTS_PROTECTED_CRUD.md`
Primary reference for protected post management.

Covers:
- admin/author access rules
- ownership behavior
- protected post routes
- create/edit/delete expectations
- management page behavior
- validation and UX rules for protected post flows

Use this when working on:
- `/admin/posts`
- create/edit post pages
- ownership-aware UI
- protected post service behavior

---

## Maintenance Rule

When the frontend evolves:

- keep this folder small
- keep only documents that still describe the **current** system
- remove outdated phase documents once their content is already reflected in the
  codebase or in broader architecture documentation
- prefer updating the essential docs instead of creating many temporary progress files

---

## Source of Truth Hierarchy

When there is any conflict, use this order:

1. actual code in `src/`
2. project-wide architecture documentation
3. the essential context files in this folder

These docs are guides for development, but the implemented code remains the final
source of truth.

---

## Current Frontend Direction

The frontend currently follows these principles:

- cookie-based authentication
- backend-managed session tokens
- protected admin/content routes
- role-aware UI for `admin` and `author`
- shared service layer for API access
- editorial visual language preserved across public and admin pages

---

## Keep / Remove Policy

### Keep
- documents that explain current auth rules
- documents that explain current protected content rules
- documents that are still useful for onboarding and maintenance

### Remove
- completed temporary phase notes
- duplicated progress trackers
- docs that describe old implementations no longer used
- generic template files that do not describe this project

---

## Final Note

If you add a new context document here, it should answer at least one of these:

- What rule exists today that is not obvious from a quick code scan?
- What architectural constraint must future work respect?
- What current behavior would be easy to break without written guidance?

If it does not answer one of those, it probably should not stay in this folder.