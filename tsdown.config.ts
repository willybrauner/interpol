import { defineConfig } from "tsdown"
import { spawn } from "child_process"

export default defineConfig({
  entry: { interpol: "src/index.ts" },
  clean: true,
  minify: true,
  dts: true,
  format: ["cjs", "esm"],
  name: "interpol",
  sourcemap: true,
  target: "esnext",
  // keep interpol.js (esm) & interpol.cjs (cjs) as output file names
  fixedExtension: false,
  async onSuccess() {
    const process = spawn("npx size-limit", { shell: true })
    process.stdout.on("data", (data) => console.log(data.toString()))
  },
})
