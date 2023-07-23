import { defineConfig } from "tsup"
import { spawn } from "child_process"

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
    compress: true,
    mangle: {
      properties: {
        regex: /^(#.+)$/,
      },
    },
  },
  async onSuccess() {
    const process = spawn("npx", ["size-limit"], { shell: true })
    process.stdout.on("data", (data) => console.log(data.toString()))
  },
})
