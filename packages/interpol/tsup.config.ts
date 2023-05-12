import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  splitting: false,
  clean: true,
  minify: true,
  dts: true,
  format: ["cjs", "esm"],
  external: ["@wbe/debug"],
  name: "interpol",
})
