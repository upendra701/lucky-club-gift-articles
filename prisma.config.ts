try {
  process.loadEnvFile(".env.local");
} catch {
}

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma 7 uses this URL for CLI commands such as `prisma migrate deploy`.
    // Keep migrations on the Supabase Session Pooler/direct-compatible connection.
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
  },
});