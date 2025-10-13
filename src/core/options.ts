import { Ticker } from "./Ticker"
import { Value } from "./types"
import { Ease } from "./ease"

/**
 * global options in window object
 */
interface InterpolOptions {
  ticker: Ticker
  durationFactor: number
  duration: Value
  ease: Ease
}

export const InterpolOptions: InterpolOptions = {
  ticker: new Ticker(),
  durationFactor: 1,
  duration: 1000,
  ease: "linear",
}
