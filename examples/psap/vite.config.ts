import { defineConfig } from "vite"
import { visualizer } from "rollup-plugin-visualizer"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    visualizer({
      filename: "./stats.html",
      title: "Generated bundle stats",
      gzipSize: true,
    }),
  ],
})
