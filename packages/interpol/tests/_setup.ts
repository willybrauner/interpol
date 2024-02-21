import { InterpolOptions } from "../src"

/**
 * Disable the internal ticker and replace it by a setInterval for nodejs tests.
 * Rate to 16ms is ~= to 60fps (1/60). It's a kind of rounded value
 * of the real requestAnimationFrame painting rate.
 */
const runFakeRaf = (rate = 16) => {
  let count = 0
  setInterval(() => {
    InterpolOptions.ticker.raf((count += rate))
  }, rate)
}
runFakeRaf()
InterpolOptions.ticker.disable()
