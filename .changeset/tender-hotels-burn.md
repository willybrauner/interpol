---
"@wbe/interpol": minor
---

Refresh computed values before timeline add() starts.

Goal of this PR is to update an external variable on the first add() onUpdate and reused it as "from" of the second add(). It will work if "from" of the second add() is a computed value. Behind the scene, we re-execute refreshComputedValues() juste before the add() starts.

```ts
let EXTERNAL_X = 0

tl.add({
  ease: "power3.in",
  props: {
    x: [0, 100],
  },
  onUpdate: ({ x }) => {
    // Mute the external value
    EXTERNAL_X = x
  },
})
tl.add({
  props: {
    // Use the updated external value as computed value
    x: [() => EXTERNAL_X, 50],
  },
  onUpdate: ({ x }) => {
    // x will be interpolated from 100 to 50
  },
})
```

In order to test this new functionality, the full Interpol Instance is now exposed from each Interpol Callbacks. It allows you to access additional properties like props computeds etc.

```ts
tl.add({
  props: {
    x: [0, 100],
  },
  onUpdate: ({ x }, time, progress, instance) => {
    // instance is available
  },
})
```
