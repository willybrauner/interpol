---
"@wbe/interpol": patch
---

Migrate the build from `tsup` to `tsdown` and update all dependencies to their latest version.

`tsup` is no longer maintained and can't emit declaration files with TypeScript 7, so the build was broken after the dependencies update.

- Build: `tsup` is replaced by `tsdown` (rolldown). The published files and the public API are the same: `interpol.js`, `interpol.cjs`, `interpol.d.ts`, `interpol.d.cts` and their sourcemaps.
- Minification: still done by `terser` (as a rolldown plugin) to keep properties mangling, the bundle size is unchanged (~3.5kB brotli).
- Dependencies: TypeScript 7, Vite 8, Vitest 5, jsdom 30, size-limit 14, changesets 3, pnpm 12.
- Tests: jsdom 30 drops invalid CSS declarations like a browser does, `styles()` tests now use valid unitless values (`0`) to check `autoUnits = false`. The `styles()` behavior is unchanged.
