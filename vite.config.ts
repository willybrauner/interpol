/// <reference types="vitest" />
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { resolve } from "path"

export default defineConfig({
  resolve: {
    alias: {
      "~": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    write: true,
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: [resolve(__dirname, "src/index.ts")],
      name: "interpol",
      fileName: "index",
    },
  },

  plugins: [
    dts({
      outputDir: ["dist"],
      staticImport: true,
      skipDiagnostics: false,
      insertTypesEntry: true,
    }),
  ],
})
