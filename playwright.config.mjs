import { defineConfig } from "@playwright/test";
import { pathToFileURL } from "node:url";
import path from "node:path";

export default defineConfig({
  testDir: "./tests/browser", workers: 1, timeout: 60000,
  use: { baseURL: "http://localhost:3100", channel: process.platform === "win32" ? "chrome" : undefined, headless: true, screenshot: "only-on-failure" },
  webServer: {
    command: "node node_modules/next/dist/bin/next dev --port 3100", url: "http://localhost:3100", reuseExistingServer: false, timeout: 120000,
    env: { NEXT_TEST_DIST_DIR: ".next-mailbox-test", GOOGLE_CLIENT_ID: "test-client", GOOGLE_CLIENT_SECRET: "test-secret", SESSION_SECRET: "browser-test-session-key", GOOGLE_REDIRECT_URI: "http://localhost:3100/api/auth/google/callback", NODE_OPTIONS: `--import=${pathToFileURL(path.resolve("tests/mock-google.mjs")).href}` }
  }
});
