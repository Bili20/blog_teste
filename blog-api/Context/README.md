# Backend Context Index

This directory keeps only the **essential backend context documents** that explain
what the API is, how authentication works, and which rules future changes must
respect.

## Purpose

Use the files in this folder to quickly understand:

- the backend architecture and responsibility boundaries
- the authentication and authorization model
- the current security rules and constraints
- the implementation expectations that should not be broken by future work

This folder should stay small and focused. It is **not** meant to keep old
phase-by-phase progress notes once those notes are no longer useful.

---

## Essential Documents

### `AUTH.md`
Primary reference for the backend authentication and authorization system.

Covers:

- JWT access token behavior
- refresh token persistence and rotation
- cookie-based auth transport
- `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`
- role-based authorization rules
- protected route expectations
- current auth security limitations and future hardening priorities

Use this when working on:

- login
- logout
- refresh token flow
- auth cookies
- protected routes
- role checks
- auth-related security improvements

---

## Source of Truth Hierarchy

When there is any conflict, use this order:

1. actual backend code in `src/`
2. project-wide architecture documentation
3. the essential context files in this folder

These documents guide development, but the implemented code remains the final
source of truth.

---

## Current Backend Direction

The backend currently follows these principles:

- clean architecture separation
- cookie-based authentication
- backend-managed session tokens
- role-based authorization
- Prisma-backed persistence
- centralized validation and error handling
- explicit security hardening backlog for auth

---

## Keep / Remove Policy

### Keep
Keep documents here only if they explain:

- a current backend rule that is easy to break
- an architectural constraint that future work must respect
- a security rule that should remain visible during maintenance
- a current system behavior that is not obvious from a quick code scan

### Remove
Remove documents here if they are:

- temporary implementation notes
- completed phase trackers
- duplicated with broader architecture docs
- outdated after major refactors
- generic template files that do not describe this project

---

## Maintenance Rule

When backend behavior changes:

- update the essential docs that still matter
- prefer revising existing docs instead of creating many temporary files
- remove stale context files once their content is reflected in code or broader architecture docs

This folder should help someone understand the backend quickly, not force them
to read historical implementation debris.

---

## Final Note

If you add a new document here, it should answer at least one of these:

- What backend rule exists today that is not obvious from a quick code scan?
- What architectural constraint must future backend work respect?
- What security behavior would be easy to break without written guidance?

If it does not answer one of those, it probably should not stay in this folder.