---
"@wbe/interpol": minor
---

Interpol constructor accept inline props! Object props still working for Backward Compatibility.

```ts
new Interpol({
      // Old object props remains available
      props: {
        x: 100,
        y: -100,
        // (will be overrided by inline props)
        top: -2000,
      },
      // NEW! inline props works outside the props object
      top: [0, 100],
      left: [-100, 100, "px"],

      onComplete: ({ x, y, top, left }) => {
      })
})
```
