type Target = HTMLElement | SVGElement | Record<string, number | string>

// Using WeakMap instead of Map allows the cached element to not be retained once removed from the DOM.
const CACHE = new WeakMap<object, Record<string, string>>()
const COORDS = new Set(["x", "y", "z"])
const NO_PX = new Set([
  "opacity",
  "scale",
  "scaleX",
  "scaleY",
  "scaleZ",
  "perspective",
  "transformOrigin",
])
const DEG_PROPERTIES = new Set([
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "skew",
  "skewX",
  "skewY",
])

function formatValue(key: string, val: number | string, format = true): string | number {
  if (!format || typeof val !== "number") return val
  if (NO_PX.has(key)) return val
  if (DEG_PROPERTIES.has(key)) return `${val}deg`
  return `${val}px`
}

/**
 * Styles function
 * @description Set CSS properties on DOM element(s) or object properties
 * @param element DOM element or object, or an array of them
 * @param props Object of css properties to set
 * @param autoUnits Auto add "px" & "deg" units to number values, string values are not affected
 * @returns
 */
export const styles = (
  element: Target | Target[] | null,
  props: Record<string, number | string>,
  autoUnits = true,
): void => {
  if (!element) return
  if (!Array.isArray(element)) element = [element as HTMLElement]

  // for each element
  for (let j = 0; j < element.length; j++) {
    const el = element[j] as HTMLElement

    // case this is a simple object, there is no transform to build
    if (!el.style) {
      for (let key in props) el[key] = formatValue(key, props[key], autoUnits)
      continue
    }

    const cache = CACHE.get(el) || {}

    // for each key
    for (let key in props) {
      const v = formatValue(key, props[key], autoUnits)
      // Specific case for "translate3d"
      // if x, y, z are keys
      if (COORDS.has(key)) {
        const val = (c: string) => formatValue(c, props?.[c] ?? cache?.[c] ?? "0px", autoUnits)
        cache.translate3d = `translate3d(${val("x")}, ${val("y")}, ${val("z")})`
        cache[key] = `${v}`
      }
      // Other transform properties
      else if (
        key.startsWith("translate") ||
        key.startsWith("rotate") ||
        key.startsWith("scale") ||
        key.startsWith("skew")
      ) {
        cache[key] = `${key}(${v})`
      }

      // All other properties, applying directly
      else {
        el.style[key] = v && `${v}`
      }
    }

    // Get the string of transform properties without COORDS (x, y and z values)
    // ex: translate3d(0px, 11px, 0px) scale(1) rotate(1deg)
    let transformString = ""
    for (const k in cache) {
      if (!COORDS.has(k)) transformString += cache[k] + " "
    }

    // Finally Apply the join transform string properties with values of COORDS
    if (transformString !== "") el.style.transform = transformString

    // Cache the transform properties object
    CACHE.set(el, cache)
  }
}
