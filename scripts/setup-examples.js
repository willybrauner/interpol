#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs"
import { resolve, dirname } from "path"
import { execSync } from "child_process"
import { fileURLToPath } from "url"
import packageJson from "../package.json" assert { type: "json" }
console.log("current version:", packageJson.version)

const __dirname = dirname(fileURLToPath(import.meta.url))

// Debug environment variables to help identify CodeSandbox
console.log('Environment debug:', {
  CODESANDBOX: process.env.CODESANDBOX,
  SANDBOX_URL: process.env.SANDBOX_URL,
  CSB: process.env.CSB,
  NODE_ENV: process.env.NODE_ENV,
  HOSTNAME: process.env.HOSTNAME,
  PWD: process.env.PWD,
  HOME: process.env.HOME,
  USER: process.env.USER,
  CI: process.env.CI
})

const isCodeSandbox = 
  process.env.FORCE_CODESANDBOX_MODE ||
  process.env.CODESANDBOX || 
  process.env.SANDBOX_URL || 
  process.env.CSB || 
  process.env.CI ||  // Many cloud environments set CI=true
  process.env.NODE_ENV === 'development' && (
    process.env.HOSTNAME?.includes('csb') ||
    process.env.HOSTNAME?.includes('codesandbox') ||
    process.env.PWD?.includes('/sandbox') ||
    process.env.HOME?.includes('/sandbox')
  )

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
