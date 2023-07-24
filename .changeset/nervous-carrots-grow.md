---
"@wbe/interpol": minor
---

breaking changes: callbacks return properties without object.

```js
new Interpol({
  // Old params
  onUpdate: ({ props, time, progress }) => {},
  onComplete: ({ props, time, progress }) => {},
  // New params
  onUpdate: (props, time, progress) => {},
  onComplete: (props, time, progress) => {},
})

new Timeline({
  // ...
  // new Params
  onUpdate: (time, progress) => {},
  onComplete: (time, progress) => {},
})
```
