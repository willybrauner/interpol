import { Ticker } from "./core/Ticker"
import { EaseFn, EaseName } from "./core/ease"

/**
 * global options in window object
 */
class Options {
  /**
   * Ticker
   */
  #ticker: Ticker = new Ticker()
  get ticker(): Ticker {
    return this.#ticker
  }

  /**
   * Default Duration
   */
  #duration = 1000
  set duration(duration: number) {
    this.#duration = duration
  }
  get duration(): number {
    return this.#duration
  }

  /**
   * Default Ease
   */
  #ease: EaseName | EaseFn = "linear"
  set ease(ease: EaseName | EaseFn) {
    this.#ease = ease
  }
  get ease(): EaseName | EaseFn {
    return this.#ease
  }
}

export const InterpolOptions = new Options()
