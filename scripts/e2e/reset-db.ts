import { execSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.e2e" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for E2E DB reset");
}

execSync("pnpm prisma db push --force-reset", {
  stdio: "inherit",
  env: process.env,
});
execSync("pnpm db:seed", {
  stdio: "inherit",
  env: process.env,
});
