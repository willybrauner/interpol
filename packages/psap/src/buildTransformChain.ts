import { PropOptions } from "./psap"
import debug from "@wbe/debug"
const log = debug(`psap:buildTransformChain`)
/**
 * Chain transforms properties
 */
export const buildTransformChain = (
  props: Map<string, PropOptions>,
  force3D: boolean = true
): string => {
  let chain = ""
  for (const [k, { from, to, transformFn, update, _isTransform }] of props) {
    if (_isTransform) chain += `${transformFn}(${update.value || from.value}${to.unit}) `
  }

  // add non animated properties

  // force 30
  //  if (!chain.includes("translateZ") && force3D) chain += "translateZ(0px) "
  log("chain", chain)
  return chain.trim()
}
