import { PropOptions } from "./psap"
import debug from "@wbe/debug"
const log = debug(`psap:buildTransformChain`)
/**
 * Chain transforms properties
 */
export const buildTransformChain = (
  target,
  props: Map<string, PropOptions>,
  valueToUse: "to" | "from" | "update" = "to"
): string => {
  // store all transform fn
  const TRANS_MAP = new Map()

  // get transform function on the target if this transform didn't exist when the target was created
  const tFn = (target as HTMLElement)?.style.transform.split(/\s(?![^(]*\))/g) || []
  for (const t of tFn) {
    const fn = t.split("(")[0]
    if (fn) TRANS_MAP.set(fn, t)
  }

  // get transform fn from props
  for (const [k, prop] of props) {
    if (prop._isTransform) {
      TRANS_MAP.set(
        prop.transformFn,
        `${prop.transformFn}(${prop[valueToUse].value}${prop.to.unit})`
      )
    }
  }

  // always add translateZ
  TRANS_MAP.set("translateZ", TRANS_MAP.get("translateZ") || "translateZ(0px)")

  let chain = ""
  for (const [key, value] of TRANS_MAP.entries()) {
    chain += `${value} `
  }

  // remove last space add the end of the chain
  chain = chain.slice(0, -1)
  return chain
}
