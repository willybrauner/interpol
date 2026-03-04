// Types
export type { InterpolConstruct, Props, TimelineConstruct, Value } from "./core/types"
export type { Ease, EaseFn, EaseName, EaseType, EaseDirection, Power } from "./core/ease"
export type { IAdd } from "./core/Timeline"

// Core
export { Interpol } from "./core/Interpol"
export { Timeline } from "./core/Timeline"
export { Ticker } from "./core/Ticker"
export { engine } from "./core/engine"

// Core factory functions
// allows to create Interpol and Timeline without "new" keyword
// and with type inference on InterpolConstruct
import { Interpol } from "./core/Interpol"
import { Timeline } from "./core/Timeline"
import type { InterpolConstruct, TimelineConstruct } from "./core/types"

export const interpol = <K extends string = string>(options: InterpolConstruct<K>): Interpol<K> =>
  new Interpol<K>(options)

export const timeline = (options?: TimelineConstruct): Timeline => new Timeline(options)

// Aditional core utils
export { Power1, Power2, Power3, Power4, Expo, easeAdapter } from "./core/ease"
export { styles } from "./core/styles"
