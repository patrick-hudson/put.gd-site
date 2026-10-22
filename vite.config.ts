import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// On put.gd only / and /_site/* reach the site bucket, so the bundle has to live under /_site/.
export default defineConfig({
  plugins: [react({ babel: { parserOpts: { plugins: ["decorators-legacy"] } } })],
  resolve: {
    alias: {
      "@putgd-enterprise": fileURLToPath(new URL("src/main/typescript/com/putgd/enterprise", import.meta.url)),
      "@putgd-enterprise-resources": fileURLToPath(new URL("src/main/resources", import.meta.url)),
      "@putgd-enterprise-test-resources": fileURLToPath(new URL("src/test/resources", import.meta.url)),
    },
  },
  publicDir: "public",
  server: { port: 4411 },
  build: { outDir: "dist", emptyOutDir: true, assetsDir: "_site/enterprise" },
  test: {
    environment: "jsdom",
    include: ["src/test/**/*.test.{ts,tsx}"],
    setupFiles: ["src/test/typescript/com/putgd/enterprise/support/TestEnvironmentSetup.ts"],
    restoreMocks: true,
  },
});
