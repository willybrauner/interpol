import { Ticker } from "./core/Ticker"
import { Value } from "./core/types"
import { Ease } from "./core/ease"

/**
 * global options in window object
 */
interface InterpolOptions {
  ticker: Ticker
  duration: Value
  ease: Ease
}

export const InterpolOptions: InterpolOptions = {
  ticker: new Ticker(),
  duration: 1000,
  ease: "linear",
}
