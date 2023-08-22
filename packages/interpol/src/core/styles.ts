const TRANSFORM_CACHE = new Map<HTMLElement, Record<string, string>>()
const COORDS = ["x", "y", "z"]
/**
 * Applying styles
 * @param element
 * @param props
 */
export const styles = (
  element: HTMLElement | HTMLElement[] | null,
  props: Record<string, string | number>
): void => {
  if (!element) return
  if (!Array.isArray(element)) element = [element]

  for (const el of element) {
    for (let key in props) {
      if (!props.hasOwnProperty(key)) return

      // Specific case for translate3d, if x, y, z are set
      if (COORDS.includes(key)) {
        const value = (c) => props[c] || TRANSFORM_CACHE.get(el)?.[c] || "0px"

        TRANSFORM_CACHE.set(el, {
          ...(TRANSFORM_CACHE.get(el) || {}),
          translate3d: `translate3d(${value("x")}, ${value("y")}, ${value("z")})`,
          [key]: `${props[key]}`,
        })
      }

      // Other transform properties
      else if (key.match(/^(translate|rotate|scale|skew)/)) {
        TRANSFORM_CACHE.set(el, {
          ...(TRANSFORM_CACHE.get(el) || {}),
          [key]: `${key}(${props[key]})`,
        })
      }

      // All other properties, applying directly
      else el.style[key] = `${props[key]}`
    }

    // Finally Apply the join transform properties
    let transforms = TRANSFORM_CACHE.get(el)
    if (transforms) {
      transforms = Object.keys(transforms).reduce(
        (a, b) => (COORDS.includes(b) ? a : { ...a, [b]: transforms[b] }),
        {}
      )
      const transObj = transforms && Object.values(transforms)
      if (transObj?.length > 0) el.style.transform = transObj.join(" ")
    }
  }
}
