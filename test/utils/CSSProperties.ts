import { toCamelCase } from "./toCamelCase"


export const CSSPropertiesDashCase = [
  "width",
  "height",
  "min-width",
  "max-width",
  "min-height",
  "max-height",
  "font-size",
  "line-height",
  "letter-spacing",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
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

  // "margin",
  // "padding",
]

export const CSSPropertiesCamelCase = CSSPropertiesDashCase.map((prop) => toCamelCase(prop))

