---
"@wbe/interpol": minor
---

tl.add method accept callback function

```ts
const tl = new Timeline()

// default Interpol constructor
tl.add({
  v: [0, 100],
  onUpdate: ({ x }, time, progress) => { ... },
})

// ✅ new! set a callback function (as GSAP `call()` does)
tl.add(() => {
  // ...
})

// with relative offset
tl.add(() => {
 // ...
}, "-=100")

// with absolute offset
tl.add(() => {
 // ...
}, 0)
```
