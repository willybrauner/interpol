---
"@wbe/interpol": minor
---

Accept ease as "GSAP like" string name.

["GSAP like" ease functions](./packages/interpol/src/core/ease.ts) are available in interpol as string too:

```js
import { Interpol, Power3 } from "@wbe/interpol"

// as typed string
new Interpol({
  ease: "power3.out",
})

// or, import the object
new Interpol({
  ease: Power3.out,
})
```
