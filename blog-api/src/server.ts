import "dotenv/config";
import { createApp } from "./app";
import prisma from "@/infrastructure/database/prisma";

const PORT = process.env.PORT ?? 3333;

async function bootstrap() {
  // Verify database connection before starting
  await prisma.$connect();
  console.log("✅ Database connected");

  const app = createApp();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   ENV: ${process.env.NODE_ENV ?? "development"}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n⚠️  ${signal} received — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log("✅ Shutdown complete");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
