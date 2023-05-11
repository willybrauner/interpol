import { PropOptions } from "./psap"

/**
 * Chain transforms properties
 */
export const buildTransformChain = (props: Map<string, PropOptions>, force3D: boolean = true): string => {
  let chain = ""
  for (const [k, { to, transformFn, update, _isTransform }] of props) {
    if (_isTransform) chain += `${transformFn}(${update.value}${to.unit}) `
  }

  // force 30
  if (!chain.includes("translateZ") && force3D) chain += "translateZ(0px) "
  return chain.trim()
}
