---
"@wbe/interpol": minor
---

Rename `refreshComputedValues()` to `refresh()`

`refreshComputedValues()` is deprecated. Use `refresh()` instead.

before:

```ts
const itp = new Interpol({ ... })
itp.refreshComputedValues()

const tl = new Timeline({ ... })
tl.refreshComputedValues()
```

after:

```ts
const itp = new Interpol({ ... })
itp.refresh()

const tl = new Timeline({ ... })
tl.refresh()
```
