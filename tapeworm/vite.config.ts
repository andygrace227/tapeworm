import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(rootDir, "src/index.ts"),
      name: "Tapeworm",
      formats: ["es", "cjs", "umd"],
      fileName: (format) => `tapeworm.${format}.js`,
    },
    rollupOptions: {
      output: {
        globals: {},
      },
    },
  },
});
