/// <reference types="vitest" />
import { defineConfig } from "vite"
import {resolve} from "path"

export default defineConfig({
  resolve: {
    alias: {
      "~": resolve(__dirname, "src"),
    },
  },
  // @ts-ignore
  test: {
    testTimeout: 15000,
  },
})
