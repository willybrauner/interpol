---
"@wbe/interpol": minor
---

Uniformize & externalize raf

- Move `Ticker` instance global for each `Interpol` & `Timeline` instances
- Remove `Ticker` from `Interpol` & `Timeline` constructors
- Use the same internal raf for each instances
- Create `InterpolOptions` to access & set global properties

```ts
import { InterpolOptions } from "@wbe/interpol"

// disable internal raf in order to use your own raf
InterpolOptions.ticker.disable()
const tick = (e) => {
  // execute Ticker.raf() callback on your own raf
  InterpolOptions.ticker.raf(e)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
```

### Defaults properties

```ts
import { InterpolOptions } from "@wbe/interpol"

// Set default duration for all Interpol instances
InterpolOptions.duration = 1000
// Set default easing for all Interpol instances
InterpolOptions.ease = (t) => t * t
```
