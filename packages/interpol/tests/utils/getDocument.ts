import { JSDOM } from "jsdom"

export const getDocument = () => {
  const dom = new JSDOM()
  const win = dom.window
  const doc = win.document
  const proxy = { proxyWindow: win, proxyDocument: doc }
  const el = doc.createElement("div")
  doc.body.append(el)
  return { dom, win, doc, proxy, el }
}
