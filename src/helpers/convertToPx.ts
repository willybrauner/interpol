/**
 * Convert any value string {number}{unit} to number in pixel value
 * @param value
 */
export const convertToPx = (value: string | number, $element: HTMLElement): number => {
  if (typeof value === "number") return value

  const match = value.match(/^(\d+(?:\.\d+)?)(\D+)$/)
  if (!match) return null
  const number = parseFloat(match[1])
  const unit = match[2]

  switch (unit) {
    case "rem":
      return parseFloat(getComputedStyle(document.documentElement).fontSize) * number
    case "em":
      return parseFloat(getComputedStyle($element).fontSize) * number
    case "vw":
      return (window.innerWidth * number) / 100
    case "vh":
      return (window.innerHeight * number) / 100
    case "vmin":
    case "vmax":
      const viewportSize = Math.max(window.innerWidth, window.innerHeight)
      return (viewportSize * number) / 100
    default:
      return number
  }
}
