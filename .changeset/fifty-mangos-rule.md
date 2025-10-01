---
"@wbe/interpol": patch
---

Timeline play return promise

before:

```ts
const timeline = new Timeline({
  onComplete: () => {
    // was properly called ✅
  },
})

timeline.play().then(() => {
  // was never called 🚫
})
```

after:

```ts
const timeline = new Timeline({
  onComplete: () => {
    // was properly called ✅
  },
})

timeline.play().then(() => {
  // is properly called now  ✅
})
```
