import { execSync } from "node:child_process";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.e2e" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for E2E DB reset");
}

execSync("pnpm prisma db push --force-reset", {
  stdio: "inherit",
  env: process.env,
});

const prisma = new PrismaClient();
async function ensureColumns() {
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "Action" ADD COLUMN IF NOT EXISTS "unit" TEXT;'
  );
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "PlayLog" ADD COLUMN IF NOT EXISTS "quantity" INTEGER;'
  );
}

ensureColumns()
  .catch((error) => {
    console.error("Failed to ensure columns:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (process.exitCode) return;
    execSync("pnpm db:seed", {
      stdio: "inherit",
      env: process.env,
    });
  });
