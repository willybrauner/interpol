---
"@wbe/interpol": patch
---

fix: Interpol & Timeline reverse Promise

`play` and `reverse` before the end of the `play`. The reverse promise was non-existent.
The expected behavior is to get a a reverse promise who resolve when the `reserve()` is complete.

before:

```ts
const duration = 1000
const itp = new Interpol({ duration })

itp.play()
await new Promise((r) => setTimeout(r, duration / 2))
await itp.reverse()
console.log("reverse complete") // bug: was called before the reverse end
```

after:

```ts
const duration = 1000
const itp = new Interpol({ duration })

itp.play()
await new Promise((r) => setTimeout(r, duration / 2))
await itp.reverse()
console.log("reverse complete") // is called when reverse is complete
```
