import { Ticker } from "./Ticker"
import { Value } from "./types"
import { Ease } from "./ease"

interface Engine {
  ticker: Ticker
  durationFactor: number
  duration: Value
  ease: Ease
}

/**
 * The global engine object.
 * Be careful when modifying its properties,
 * as they will affect all Interpol & Timeline instances
 */
export const engine: Engine = {
  ticker: new Ticker(),
  durationFactor: 1,
  duration: 1000,
  ease: "linear",
}
