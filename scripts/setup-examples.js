#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs"
import { resolve, dirname } from "path"
import { execSync } from "child_process"
import { fileURLToPath } from "url"

// Read package.json version
const packageJson = JSON.parse(
  readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../package.json"), "utf8"),
)
console.log("current version:", packageJson.version)

const __dirname = dirname(fileURLToPath(import.meta.url))

// CodeSandbox detection based on environment patterns
const isCodeSandbox =
  process.env.FORCE_CODESANDBOX_MODE ||
  process.env.CODESANDBOX ||
  process.env.SANDBOX_URL ||
  process.env.CSB ||
  // CodeSandbox specific patterns
  (process.env.CI === "true" &&
    (process.env.HOSTNAME?.includes("ci-") ||
      process.env.PWD?.startsWith("/tmp/") ||
      process.env.HOME === "/home/node"))

// Dynamically read all examples from the examples directory
const examplesDir = resolve(__dirname, "../examples")
const examples = readdirSync(examplesDir).filter((name) => {
  const fullPath = resolve(examplesDir, name)
  return statSync(fullPath).isDirectory() && existsSync(resolve(fullPath, "package.json"))
})

console.log(`🔧 Setup examples for ${isCodeSandbox ? "CodeSandbox" : "local development"}`)

if (isCodeSandbox) {
  // Build the library first
  console.log("📦 Building @wbe/interpol...")
  try {
    execSync("pnpm build", { stdio: "inherit", cwd: resolve(__dirname, "..") })
  } catch (error) {
    console.error("❌ Failed to build library")
    process.exit(1)
  }

  // Replace workspace dependencies with file references
  examples.forEach((example) => {
    const packageJsonPath = resolve(__dirname, `../examples/${example}/package.json`)

    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))

      if (packageJson.dependencies && packageJson.dependencies["@wbe/interpol"]) {
        console.log(`🔗 Updating ${example} dependencies for CodeSandbox...`)
        packageJson.dependencies["@wbe/interpol"] = `^${packageJson.version}`
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n")
      }
    }
  })

  console.log("✅ Examples configured for CodeSandbox")
} else {
  // Ensure workspace dependencies are set for local development
  examples.forEach((example) => {
    const packageJsonPath = resolve(__dirname, `../examples/${example}/package.json`)

    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))

      if (packageJson.dependencies && packageJson.dependencies["@wbe/interpol"]) {
        const currentDep = packageJson.dependencies["@wbe/interpol"]
        if (currentDep !== "workspace:*") {
          console.log(`🔗 Restoring ${example} workspace dependency...`)
          packageJson.dependencies["@wbe/interpol"] = "workspace:*"
          writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n")
        }
      }
    }
  })

  console.log("✅ Examples configured for local development")
}
