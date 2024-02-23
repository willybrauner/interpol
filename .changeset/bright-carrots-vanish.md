---
"@wbe/interpol": patch
---

Improve props type

```ts
new Interpol({
  props: { x: [0, 100] },
  onUpdate: ({ x }) => {
    // in this case "x" is a number, because no unit is set.
  },
})

new Interpol({
  props: { x: [0, 100, "px"] },
  onUpdate: ({ x }) => {
    // in this case "x" is a string, because unit is set.
  },
})
```

The problem solved, is to make more permissive the prop type in order to set more easily as `number` or `string`.

Before:

```ts
new Interpol({
  props: { x: [0, 100] },
  onUpdate: ({ x }) => {
    const a: number = x // TS error because number | string is not compatible to number
  },
})
```

After:

```ts
new Interpol({
  props: { x: [0, 100] },
  onUpdate: ({ x }) => {
    const a: number = x // No error
  },
})
```
