import "./index.css"
import { Interpol } from "@wbe/interpol"

/**
 * Query
 */
const progress0 = document.querySelector<HTMLButtonElement>(".progress-0")
const progress05 = document.querySelector<HTMLButtonElement>(".progress-05")
const progress1 = document.querySelector<HTMLButtonElement>(".progress-1")
const inputProgress = document.querySelector<HTMLInputElement>(".progress")
const inputSlider = document.querySelector<HTMLInputElement>(".slider")

/**
 * Events
 */
;["play", "reverse", "pause", "stop", "resume"].forEach(
  (name: any) =>
    (document.querySelector<HTMLButtonElement>(`.${name}`)!.onclick = () => {
      // @ts-ignore
      itp[name]()
    }),
)

progress0!.onclick = () => itp.progress(0, false)
progress05!.onclick = () => itp.progress(0.5, false)
progress1!.onclick = () => itp.progress(1, false)

inputProgress!.onchange = () => itp.progress(parseFloat(inputProgress!.value) / 100, false)
inputSlider!.oninput = () => itp.progress(parseFloat(inputSlider!.value) / 100, false)

const itp = new Interpol({
  v: [0, 1],
  duration: 2000,
  onUpdate: ({ v }) => {
    document.body.style.background = interpolateColor("rgb(0, 10, 0)", "#DDDDDD", v)
  },
})

/**
 *  Interpolate color helper generate by phind
 * @param color1
 * @param color2
 * @param percent
 */
function interpolateColor(color1: string, color2: string, percent: number) {
  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }
  // Helper function to convert RGB to hex
  const rgbToHex = (rgb) => {
    const { r, g, b } = rgb
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }
  // Helper function to convert RGB string to object
  const rgbStringToObject = (rgbString) => {
    const [r, g, b] = rgbString.match(/\d+/g)
    return { r: parseInt(r), g: parseInt(g), b: parseInt(b) }
  }
  // Helper function to convert RGB object to string
  const rgbObjectToString = (rgb) => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  // Check if the input is in hex format
  const isHex = (color) => color.startsWith("#")
  // Convert the input colors to RGB objects
  const rgb1 = isHex(color1) ? hexToRgb(color1) : rgbStringToObject(color1)
  const rgb2 = isHex(color2) ? hexToRgb(color2) : rgbStringToObject(color2)
  // Interpolate the RGB values
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * percent)
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * percent)
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * percent)
  // Convert the interpolated RGB values back to the original format
  return isHex(color1) ? rgbToHex({ r, g, b }) : rgbObjectToString({ r, g, b })
}
