import { El } from "./types"

const TRANSFORM_CACHE = new Map<HTMLElement, Record<string, string>>()
const COORDS = ["x", "y", "z"]

/**
 * Applying styles on DOM element
 * @param element
 * @param props
 */
export const styles = (element: El, props: Record<string, string | number>): void => {
  if (!element) return
  if (!Array.isArray(element)) element = [element as HTMLElement]

  for (const el of element) {
    const transforms = TRANSFORM_CACHE.get(el) || {}

    for (let key in props) {
      // Specific case for "translate3d"
      // if x, y, z are keys
      if (COORDS.includes(key)) {
        const value = (c) => props?.[c] || transforms?.[c] || "0px"
        transforms.translate3d = `translate3d(${value("x")}, ${value("y")}, ${value("z")})`
        transforms[key] = `${props[key]}`
      }
      // Other transform properties
      else if (key.match(/^(translate|rotate|scale|skew)/)) {
        transforms[key] = `${key}(${props[key]})`
      }
      // All other properties, applying directly
      else {
        // case this is a style property
        if (el.style) el.style[key] = props[key] && `${props[key]}`
        // case this is a simple object
        else el[key] = props[key]
      }
    }

    // Get the string of transform properties without COORDS (x, y and z values)
    // ex: translate3d(0px, 11px, 0px) scale(1) rotate(1deg)
    const transformString = Object.keys(transforms)
      .reduce((a, b) => (COORDS.includes(b) ? a : a + transforms[b] + " "), "")
      .trim()

    // Finally Apply the join transform properties with values of COORDS
    if (transformString !== "") el.style.transform = transformString

    // Cache the transform properties object
    TRANSFORM_CACHE.set(el, transforms)
  }
}
