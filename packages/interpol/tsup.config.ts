import { defineConfig } from "tsup"
import { Ticker } from "./src"

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
        // reserved: [
        //   "key",
        //   "props",
        //   "duration",
        //   "ease",
        //   "reverseEase",
        //   "paused",
        //   "delay",
        //   "beforeStart",
        //   "onUpdate",
        //   "onComplete",
        //   "debug",
        //   "ticker",
        // ],
      },
    },
  },
})
