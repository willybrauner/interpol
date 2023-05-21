import { PropOptions } from "./psap"
import debug from "@wbe/debug"
const log = debug(`psap:buildTransformChain`)
/**
 * Chain transforms properties
 */
export const buildTransformChain = (
  props: Map<string, PropOptions>,
  valueToUse: "to" | "from" | "update" = "to",
  force3D: boolean = true
): string => {
  let chain = ""
  for (const [k, prop] of props) {
    if (prop._isTransform) {
      chain += `${prop.transformFn}(${prop[valueToUse].value}${prop.to.unit}) `
    }
  }

//  log("chain", chain)
  // add non animated properties

  // force 30
  //  if (!chain.includes("translateZ") && force3D) chain += "translateZ(0px) "
  // log("chain", chain)
  return chain.trim()
}
