import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text"],
      include: ["src/**/*.ts"],
      provider: "istanbul",
    },
  },
});
