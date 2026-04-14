# The Margin Blog — Vibecode Study Project

This is a personal study project built entirely with **vibecoding** — iterating fast,
learning by doing, and letting curiosity drive the architecture decisions.

## What it is

A full-stack blog application with a clean, minimal editorial focus.
Built as a hands-on exercise to explore Clean Architecture, REST API design,
modern React patterns, and full-stack TypeScript across a monorepo.

## Structure

```
blog_teste/
├── blog-api/      # REST API — Node.js · Express · Prisma · SQLite
└── blog-client/   # Frontend — React · TypeScript · Vite
```

## Stack at a glance

| Layer | Tech |
|---|---|
| API | Node.js, Express 4, Prisma, SQLite (LibSQL), Zod, JWT |
| Frontend | React, TypeScript, Vite |
| Auth | HTTP-only cookies, JWT access token, hashed refresh tokens |

## Purpose

No production ambitions. This repo exists to study and practice:

- Clean Architecture in a Node.js backend
- Manual dependency injection (no container)
- Cookie-based auth with refresh token rotation
- Monorepo organisation without extra tooling

---
