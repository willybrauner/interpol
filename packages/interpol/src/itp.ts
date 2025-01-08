import { InterpolConstruct, Props } from "./core/types"
import { Interpol } from "./index"

export function itp<K extends keyof Props = keyof Props>(options: InterpolConstruct<K>): Interpol<K> {
  return new Interpol(options)
}
