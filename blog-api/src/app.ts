import "express-async-errors";
import express, { Application, Request, Response } from "express";
import cors from "cors";

// Infrastructure
import prisma from "@/infrastructure/database/prisma";
import { PrismaPostRepository } from "@/infrastructure/repositories/PrismaPostRepository";
import { PrismaAuthorRepository } from "@/infrastructure/repositories/PrismaAuthorRepository";
import { PrismaTagRepository } from "@/infrastructure/repositories/PrismaTagRepository";
import { PrismaAuthRepository } from "@/infrastructure/repositories/PrismaAuthRepository";

// Services
import { PostService } from "@/application/services/PostService";
import { AuthorService } from "@/application/services/AuthorService";
import { TagService } from "@/application/services/TagService";
import { AuthService } from "@/application/services/AuthService";

// Controllers
import { PostController } from "@/presentation/controllers/PostController";
import { AuthorController } from "@/presentation/controllers/AuthorController";
import { TagController } from "@/presentation/controllers/TagController";
import { AuthController } from "@/presentation/controllers/AuthController";

// Routes
import { postRoutes } from "@/presentation/routes/post.routes";
import { authorRoutes } from "@/presentation/routes/author.routes";
import { tagRoutes } from "@/presentation/routes/tag.routes";
import { authRoutes } from "@/presentation/routes/auth.routes";

// Middlewares
import { errorHandler } from "@/presentation/middlewares/errorHandler";
import { requestLogger } from "@/presentation/middlewares/requestLogger";

export function createApp(): Application {
  const app = express();

  // ── Global middlewares ──────────────────────────────────────────────────────
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // ── Dependency injection (manual, no container needed at this scale) ────────
  const postRepository = new PrismaPostRepository(prisma);
  const authorRepository = new PrismaAuthorRepository(prisma);
  const tagRepository = new PrismaTagRepository(prisma);
  const authRepository = new PrismaAuthRepository(prisma);

  const postService = new PostService(postRepository);
  const authorService = new AuthorService(authorRepository);
  const tagService = new TagService(tagRepository);
  const authService = new AuthService(authRepository);

  const postController = new PostController(postService);
  const authorController = new AuthorController(authorService);
  const tagController = new TagController(tagService);
  const authController = new AuthController(authService);

  // ── Routes ──────────────────────────────────────────────────────────────────
  app.use("/api/auth", authRoutes(authController));
  app.use("/api/posts", postRoutes(postController));
  app.use("/api/authors", authorRoutes(authorController));
  app.use("/api/tags", tagRoutes(tagController));

  // ── Health check ────────────────────────────────────────────────────────────
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ── 404 handler ─────────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "NotFound", message: "Route not found" });
  });

  // ── Global error handler (must be last) ─────────────────────────────────────
  app.use(errorHandler);

  return app;
}
