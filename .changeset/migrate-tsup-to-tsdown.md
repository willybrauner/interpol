---
"@wbe/interpol": patch
---

Migrate the build from `tsup` to `tsdown` and update all dependencies to their latest version.

`tsup` is no longer maintained and can't emit declaration files with TypeScript 7, so the build was broken after the dependencies update.

- Build: `tsup` + `terser` are replaced by `tsdown` (rolldown / oxc). The published files and the public API are the same: `interpol.js`, `interpol.cjs`, `interpol.d.ts`, `interpol.d.cts` and their sourcemaps.
- Bundle size: ~3.5kB (was ~3kB). The oxc minifier doesn't mangle properties like `terser` did, the size limit of 3.6kB is unchanged.
- Dependencies: TypeScript 7, Vite 8, Vitest 5, jsdom 30, size-limit 14, changesets 3, pnpm 12.
- Tests: jsdom 30 drops invalid CSS declarations like a browser does, `styles()` tests now use valid unitless values (`0`) to check `autoUnits = false`. The `styles()` behavior is unchanged.
