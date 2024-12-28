---
"@wbe/interpol": minor
---

Use the initial Interpol ticker instance for all raf callback of the application.

A new second param `rank: number` is added to `add()` method. It allows to choose in each order, the callback handker need to be executed. In this exemple, this one is second position, because Interpol ranking is 0

```ts
import { InterpolOptions } from "@wbe/interpol"

const tickHandler = (t) => console.log(t)
const rank = 1
InterpolOptions.ticker.add(tickHandler, rank)
// ...
InterpolOptions.ticker.remove(tick)
```

Using a new ticker instance for all the application:

```ts
import { Ticker, InterpolOptions } from "@wbe/interpol"

// disable the default Interpol ticker
InterpolOptions.disable()

// create a new ticker instance
const ticker = new Ticker()

// Add manually the raf method to the callback list of the new ticker
const interpolTick = (t) => {
  InterpolOptions.ticker.raf(e)
}
ticker.add(interpolTick, 0)

// Add a new callback to this same ticker instance on rank '1'
const scrollerTick = (t) => {
  // ....
}
ticker.add(scrollerTick, 1)
```
