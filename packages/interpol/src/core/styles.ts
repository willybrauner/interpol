// prettier-ignore
export const styles = (
  element: HTMLElement | HTMLElement[] | null,
  props: Record<string, string | number>
) => {
  if (!element) return
  if (!Array.isArray(element)) element = [element]

  for (const el of element) {
    const transform = new Set<string>()

    for (const key in props) {
      if (!props.hasOwnProperty(key)) return

      // Specific case for translate3d
      if (["x", "y", "z"].includes(key)) {
        const value = (axis) => props[axis] || "0px"
        transform.add(`translate3d(${value("x")}, ${value("y")}, ${value("z")})`)
      }

      // Other transform properties
      else if (key.match(/^(translate|rotate|scale|skew)/))
        transform.add(`${key}(${props[key]})`)

      // All other properties, applying directly
      else
        el.style[key] = `${props[key]}`

    }

    // Finally Apply the join transform properties
    if (transform.size > 0)
      el.style.transform = Array.from(transform).join(" ")

  }
}

/**
 * Adapter for Interpol
 * @param element
 */
export const updateStyles = (element: HTMLElement | HTMLElement[] | null) => (params) =>
  styles(element, params)
