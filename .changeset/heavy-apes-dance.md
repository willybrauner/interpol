---
"@wbe/interpol": minor
---

meta fields

`Interpol` constructor now accepts a `Record<string, any>` `meta` field object to access custom Interpol properties from the instance.

```ts
const itp = new Interpol({
  meta: {
    type: "first",
  },
  x: [0, 100],
  onUpdate: ({ x }) => {
    // ...
  },
})

console.log(itp.meta) // { type: "first" }
```
