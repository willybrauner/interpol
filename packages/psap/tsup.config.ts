import { defineConfig } from "tsup"

export default defineConfig({
  entry: { psap: "src/index.ts" },
  splitting: false,
  clean: true,
  minify: true,
  dts: true,
  format: ["cjs", "esm"],
  external: ["@wbe/debug"],
  name: "psap",
  globalName: "psap"
})
