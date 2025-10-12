import "./index.css"
import { EaseName, Interpol } from "@wbe/interpol"
import { Pane } from "tweakpane"

const PARAMS = {
  ease: "power3.out" as EaseName,
  duration: 2000,
  colorFrom: "rgb(0, 10, 0)",
  colorTo: "#4bafcf",
}

/**
 * Interpol
 */
const itp = new Interpol({
  paused: true,
  v: [0, 1],
  duration: 2000,
  onUpdate: ({ v }) => {
    document.body.style.background = interpolateColor(PARAMS.colorFrom, PARAMS.colorTo, v)
  },
})

const loop = async () => {
  await itp.play()
  await itp.reverse()
  loop()
}
loop()

/**
 * Controls Pane
 */
const pane = new Pane({ title: "Controls", expanded: true })
pane.addButton({ title: "play (loop)" }).on("click", () => loop())
pane.addButton({ title: "reverse" }).on("click", () => itp.reverse())
pane.addButton({ title: "pause" }).on("click", () => itp.pause())
pane.addButton({ title: "resume" }).on("click", () => itp.resume())
pane.addButton({ title: "stop" }).on("click", () => itp.stop())
pane.addButton({ title: "refresh" }).on("click", () => itp.refresh())
pane.addBinding({ progress: itp.progress() }, "progress", { min: 0, max: 1 }).on("change", (ev) => {
  itp.progress(ev?.value || 0)
})
pane.addBinding(PARAMS, "duration", { min: 0, max: 10000, step: 100 }).on("change", () => {
  itp.refresh()
})
// prettier-ignore
const eases = [ "linear", "expo.in", "expo.out", "expo.inOut", "power1.in", "power1.out", "power1.inOut", "power2.in", "power2.out", "power2.inOut", "power3.in", "power3.out", "power3.inOut"]
.reduce((acc, cur) => {
    acc[cur] = cur
    return acc
  },
  {} as Record<string, string>,
)
pane
  .addBinding(PARAMS, "ease", {
    options: eases,
  })
  .on("change", () => {
    itp.refresh()
  })
pane.addBinding(PARAMS, "colorFrom", { label: "color from" }).on("change", () => {
  itp.refresh()
})
pane.addBinding(PARAMS, "colorTo", { label: "color to" }).on("change", () => {
  itp.refresh()
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
