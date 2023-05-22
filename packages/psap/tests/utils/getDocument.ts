import { JSDOM } from "jsdom"

export const getDocument = () => {
  const dom = new JSDOM()
  const win = dom.window
  const doc = dom.window.document
  const proxy = { proxyWindow: win, proxyDocument: doc }

  const $el = doc.createElement("div")
  $el.classList.add("el")
  doc.body.appendChild($el)

  const $el2 = doc.createElement("div")
  $el2.classList.add("el")
  doc.body.appendChild($el2)

  return { dom, win, doc, proxy, $el, $el2 }
}
