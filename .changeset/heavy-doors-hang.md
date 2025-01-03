---
"@wbe/interpol": minor
---

Set a new the global `durationFactor` for each Interpol instances.
It makes the Interpol usage more closer to gsap, if needed:

```ts
import { Interpol, InterpolOptions } from "@wbe/interpol"

// set a new global durationFactor
InterpolOptions.durationFactor = 1000 // second
new Interpol({
  duration: 1, // 1 = one second
  onComplete: (_, time) => {
    console.log(time) // 1000
  },
})
```
