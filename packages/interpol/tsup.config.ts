import { defineConfig } from "tsup"

export default defineConfig({
  entry: { interpol: "src/index.ts" },
  splitting: false,
  clean: true,
  minify: "terser",
  dts: true,
  format: ["cjs", "esm"],
  external: ["@wbe/debug"],
  name: "interpol",
  sourcemap: true,
  terserOptions: {
    mangle: {
      properties: true,
    },
  }
})
