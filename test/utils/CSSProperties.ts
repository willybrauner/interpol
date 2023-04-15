import { toCamelCase } from "./toCamelCase"

export const propsDashCase = [
  "width",
  "height",
  "min-width",
  "max-width",
  "min-height",
  "max-height",
  "font-size",
  "line-height",
  "letter-spacing",
  // "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  // "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border",
  "border-width",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-radius",
  "top",
  "right",
  "bottom",
  "left",
]

export const propsCamelCase = propsDashCase.map((prop) => toCamelCase(prop))

