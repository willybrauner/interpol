import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // cross-origin isolation is required by performance.measureUserAgentSpecificMemory()
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
})
