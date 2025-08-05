---
"@wbe/interpol": patch
---

Fix a bug when we mix absolute and relative Timeline add offsets:

before:

```ts
const tl = new Timeline()

tl.add({}, 1000)
tl.add({}, "-=100") // was not started to 900 but -100 🚫
```

after:

```ts
const tl = new Timeline()

tl.add({}, 1000)
tl.add({}, "-=100") // is started to 900ms ✅
```
