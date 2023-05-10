import debug from "@wbe/debug"
const log = debug(`interpol:convertValueToUnitValue`)

/**
 * Convert a value from unit value to another unit value
 * ex:
 *  [2rem, 50%]
 *  will return something as [0.5%, 50%]
 *
 * @return a number value
 */
export function convertValueToUnitValue(
  el: HTMLElement,
  value,
  fromUnit: string,
  toUnit: string,
  pWindow = window,
  pDocument = document
): number {
  if (fromUnit === toUnit) {
    log("unit 'from' and 'to' are the same, return the value", value)
    return value
  }
  // log({ fromUnit, toUnit, value })
  // create a temp node element in order to get his width
  const tempEl = pDocument.createElement(el.tagName)
  const parentEl = el.parentNode && el.parentNode !== pDocument ? el.parentNode : pDocument.body
  tempEl.style.position = "absolute"
  tempEl.style.width = 100 + "%"
  parentEl.appendChild(tempEl)
  const tempWidthPx = tempEl.offsetWidth
  parentEl.removeChild(tempEl)

  // get font-sizes
  const parentFontSize = parseFloat(pWindow.getComputedStyle(el.parentElement).fontSize)
  const baseFontSize = parseFloat(pWindow.getComputedStyle(pDocument.documentElement).fontSize)

  // need some tests...
  const units = {
    rem: baseFontSize,
    em: parentFontSize,
    "%": tempWidthPx / 100,
    px: 1,
    pt: 4 / 3,
    in: 96,
    cm: 96 / 2.54,
    mm: 96 / 25.4,
    ex: parentFontSize / 2,
    ch: parentFontSize * 8.8984375,
    pc: 16,
    vw: pWindow.innerWidth / 100,
    vh: pWindow.innerHeight / 100,
    vmin: Math.min(pWindow.innerWidth, pWindow.innerHeight) / 100,
    vmax: Math.max(pWindow.innerWidth, pWindow.innerHeight) / 100,
    deg: Math.PI / 180,
    rad: 1,
    turn: 360,
  }

  const pixelValue = value * units[fromUnit]
  return pixelValue / units[toUnit]
}
