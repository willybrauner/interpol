import { describe, expect, it } from "vitest"
import { JSDOM } from "jsdom"
import { anim } from "../src"
import { randomRange } from "./utils/randomRange"
import { propsCamelCase } from "./utils/CSSProperties"
import { wait } from "./utils/wait"

const getDocument = () => {
  const dom = new JSDOM()
  const win = dom.window
  const doc = win.document
  const proxy = { proxyWindow: win, proxyDocument: doc }
  const $el = doc.createElement("div")
  doc.body.append($el)
  return { dom, win, doc, proxy, $el }
}

describe.concurrent("anim with different units", () => {
  it("should anim an unit from the same unit", () => {})
  it("should anim an unit from another unit", () => {})
})
