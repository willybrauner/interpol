---
"@wbe/interpol": minor
---

Array prop value accepts keyframes 🎉

before:

```ts
const itp = new Interpol({
  // Array prop value was limited to [from, to]
  x: [0, -100],
  duration: 1000,
  onUpdate: ({ scale, x }) => {
    // ...
  },
})
```

after:

```ts
const itp = new Interpol({
  // Array prop value can now accept multiples keyframes
  x: [0, -100, 100, -50, 50, -25, 25, 0],
  duration: 1000,
  onUpdate: ({ scale, x }) => {
    // ...
  },
})
```

In this example, the `x` prop will animate through the values in the array, **across the duration of the animation**. The progress will be divided into equal segments based on the number of keyframes, and the value will interpolate between each segment accordingly.

This allows to create more complex animations with multiple segments without having to create multiple Interpol.
