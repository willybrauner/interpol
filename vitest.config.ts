/// <reference types="vitest" />
import { defineConfig } from "vite"

export default defineConfig({
  // @ts-ignore
  test: {
    testTimeout: 15000,
  },
})
