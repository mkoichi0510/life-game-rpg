import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.e2e" });

const baseURL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    timezoneId: "Asia/Tokyo",
  },
  webServer: {
    command: "pnpm e2e:db:reset && pnpm next build --webpack && pnpm start",
    url: baseURL,
    reuseExistingServer: true,
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
      NEXT_PUBLIC_APP_URL: baseURL,
      NEXT_DISABLE_GOOGLE_FONTS: "1",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /.*\.mobile\.spec\.ts/,
    },
    {
      name: "webkit-smoke",
      use: { ...devices["Desktop Safari"] },
      testMatch: /.*\.smoke\.spec\.ts/,
    },
    {
      name: "iphone-se",
      use: { ...devices["iPhone SE"] },
      testMatch: /.*\.mobile\.spec\.ts/,
    },
    {
      name: "iphone-14",
      use: { ...devices["iPhone 14"] },
      testMatch: /.*\.mobile\.spec\.ts/,
    },
  ],
});
