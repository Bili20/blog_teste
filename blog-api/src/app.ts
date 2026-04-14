import "express-async-errors";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "node:path";
import { parse as parseCookie } from "cookie";

// Infrastructure
import prisma from "@/infrastructure/database/prisma";
import { PrismaPostRepository } from "@/infrastructure/repositories/PrismaPostRepository";
import { PrismaAuthorRepository } from "@/infrastructure/repositories/PrismaAuthorRepository";
import { PrismaTagRepository } from "@/infrastructure/repositories/PrismaTagRepository";
import { PrismaAuthRepository } from "@/infrastructure/repositories/PrismaAuthRepository";
import { PrismaMediaRepository } from "@/infrastructure/repositories/PrismaMediaRepository";

// Services
import { PostService } from "@/application/services/PostService";
import { AuthorService } from "@/application/services/AuthorService";
import { TagService } from "@/application/services/TagService";
import { AuthService } from "@/application/services/AuthService";
import { MediaService } from "@/application/services/MediaService";

// Controllers
import { PostController } from "@/presentation/controllers/PostController";
import { AuthorController } from "@/presentation/controllers/AuthorController";
import { TagController } from "@/presentation/controllers/TagController";
import { AuthController } from "@/presentation/controllers/AuthController";
import { UploadController } from "@/presentation/controllers/UploadController";

// Routes
import { postRoutes } from "@/presentation/routes/post.routes";
import { authorRoutes } from "@/presentation/routes/author.routes";
import { tagRoutes } from "@/presentation/routes/tag.routes";
import { authRoutes } from "@/presentation/routes/auth.routes";
import { uploadRoutes } from "@/presentation/routes/upload.routes";

// Middlewares
import { errorHandler } from "@/presentation/middlewares/errorHandler";
import { requestLogger } from "@/presentation/middlewares/requestLogger";

export function createApp(): Application {
  const app = express();

  // ── Global middlewares ──────────────────────────────────────────────────────
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use((req, _res, next) => {
    const cookieHeader = req.headers.cookie;

    req.cookies = cookieHeader ? parseCookie(cookieHeader) : {};

    next();
  });
  //app.use(requestLogger);

  // ── Static file serving ─────────────────────────────────────────────────────
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // ── Dependency injection (manual, no container needed at this scale) ────────
  const postRepository = new PrismaPostRepository(prisma);
  const authorRepository = new PrismaAuthorRepository(prisma);
  const tagRepository = new PrismaTagRepository(prisma);
  const authRepository = new PrismaAuthRepository(prisma);
  const mediaRepository = new PrismaMediaRepository(prisma);

  const mediaService = new MediaService(mediaRepository);
  const postService = new PostService(postRepository, mediaService);
  const authorService = new AuthorService(authorRepository);
  const tagService = new TagService(tagRepository);
  const authService = new AuthService(authRepository);

  const postController = new PostController(postService);
  const authorController = new AuthorController(authorService);
  const tagController = new TagController(tagService);
  const authController = new AuthController(authService);
  const uploadController = new UploadController(mediaService);

  // ── Routes ──────────────────────────────────────────────────────────────────
  app.use("/api/auth", authRoutes(authController));
  app.use("/api/posts", postRoutes(postController, postService));
  app.use("/api/authors", authorRoutes(authorController));
  app.use("/api/tags", tagRoutes(tagController));
  app.use("/api/uploads", uploadRoutes(uploadController));

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
