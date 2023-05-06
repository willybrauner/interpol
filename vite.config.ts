import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { resolve } from "path"
import { visualizer } from "rollup-plugin-visualizer"

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
      formats: ["es", "cjs", "umd"],
    },
  },

  plugins: [
    dts({
      outputDir: ["dist"],
      staticImport: true,
      skipDiagnostics: false,
      insertTypesEntry: true,
    }),

    visualizer({
      filename: "./stats.html",
      title: "Generated bundle stats",
      gzipSize: true,
    }),
  ],
})
