import { defineConfig, type Rolldown } from "tsdown"
import { spawn } from "child_process"
import { minify } from "terser"

// rolldown minifier can't mangle properties, terser does
const terser = (): Rolldown.Plugin => ({
  name: "terser",
  async renderChunk(code, chunk, { format }) {
    if (/\.d\.c?ts$/.test(chunk.fileName)) return null
    const result = await minify(code, {
      module: format === "es",
      toplevel: format === "cjs",
      sourceMap: true,
      compress: true,
      mangle: {
        properties: {
          regex: /^(#.+|_isAbsoluteOffset)$/,
        },
      },
    })
    return { code: result.code, map: result.map as string }
  },
})

export default defineConfig({
  entry: { interpol: "src/index.ts" },
  clean: true,
  minify: false,
  dts: true,
  format: ["cjs", "esm"],
  name: "interpol",
  sourcemap: true,
  target: "esnext",
  // keep interpol.js (esm) & interpol.cjs (cjs) as output file names
  fixedExtension: false,
  plugins: [terser()],
  async onSuccess() {
    const process = spawn("npx size-limit", { shell: true })
    process.stdout.on("data", (data) => console.log(data.toString()))
  },
})
