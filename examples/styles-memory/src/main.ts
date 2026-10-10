import "./index.css"
import { Interpol, styles as stylesWeakMap } from "@wbe/interpol"
import { Pane } from "tweakpane"
import { styles as stylesMap, CACHE } from "./stylesMap"

/**
 * Compare what the styles() cache retains with a Map (before) and a WeakMap (after).
 *
 * Each cycle creates a "page" of elements, animates them with styles(), then removes
 * the page from the DOM. Nothing references these elements anymore, except the styles()
 * cache: a FinalizationRegistry counts the ones the garbage collector really frees.
 */

// The cache type comes from the URL, each test runs in a fresh page
const url = new URL(location.href)
const PARAMS = {
  cache: url.searchParams.get("cache") === "Map" ? "Map" : "WeakMap",
  elements: 300,
  duration: 600,
  run: true,
}
const styles = PARAMS.cache === "Map" ? stylesMap : stylesWeakMap

const STATS = {
  pages: 0,
  created: 0,
  collected: 0,
  get retained() {
    return this.created - this.collected
  },
  get mapSize() {
    return CACHE.size
  },
  memory: "…",
}

// Called by the garbage collector each time an element is freed
const registry = new FinalizationRegistry(() => STATS.collected++)

const root = document.getElementById("root")!
const random = (min: number, max: number): number => Math.random() * (max - min) + min

/**
 * Create a page, animate its elements, then remove it from the DOM
 */
const playPage = async (): Promise<void> => {
  const page = document.createElement("div")
  page.className = "page"
  root.appendChild(page)
  const itps: Interpol[] = []

  for (let i = 0; i < PARAMS.elements; i++) {
    const el = document.createElement("div")
    el.className = "element"
    page.appendChild(el)
    registry.register(el, null)

    styles(el, { background: `hsl(${random(220, 290)}, 60%, 60%)` })
    itps.push(
      new Interpol({
        paused: true,
        duration: PARAMS.duration,
        ease: "power2.out",
        x: [0, random(-innerWidth / 2, innerWidth / 2)],
        y: [0, random(-innerHeight / 2, innerHeight / 2)],
        rotate: [0, random(-360, 360)],
        scale: [0, 1],
        onUpdate: ({ x, y, rotate, scale }) => styles(el, { x, y, rotate, scale }),
      }),
    )
  }

  STATS.pages++
  STATS.created += itps.length
  await Promise.all(itps.map((itp) => itp.play()))

  // The elements are now only referenced by the styles() cache
  page.remove()
}

let isLooping = false
const loop = async (): Promise<void> => {
  if (isLooping) return
  isLooping = true
  while (PARAMS.run) await playPage()
  isLooping = false
}
loop()

/**
 * Memory
 */
const toMB = (bytes: number): string => `${(bytes / 1024 / 1024).toFixed(1)} MB`

const watchMemory = async (): Promise<void> => {
  const perf = performance as any
  // JS + DOM memory, Chrome only, on a cross-origin isolated page (see vite.config.ts)
  // The promise is resolved by the browser after a garbage collection, it can take a while
  if (crossOriginIsolated && perf.measureUserAgentSpecificMemory) {
    while (true) {
      const { bytes } = await perf.measureUserAgentSpecificMemory()
      STATS.memory = `${toMB(bytes)} (JS + DOM)`
    }
  }
  // JS heap only (DOM nodes are not counted), Chrome only
  else if (perf.memory) {
    setInterval(() => (STATS.memory = `${toMB(perf.memory.usedJSHeapSize)} (JS heap)`), 1000)
  } else {
    STATS.memory = "not available"
  }
}
watchMemory()

/**
 * Tweakpane
 */
const pane = new Pane({ title: `styles() cache: ${PARAMS.cache}`, expanded: true })

pane
  .addBinding(PARAMS, "cache", { options: { Map: "Map", WeakMap: "WeakMap" } })
  .on("change", ({ value }) => {
    url.searchParams.set("cache", value)
    location.href = url.href
  })
pane.addBinding(PARAMS, "elements", { min: 10, max: 2000, step: 10, label: "els / page" })
pane.addBinding(PARAMS, "duration", { min: 100, max: 3000, step: 100 })
pane.addBinding(PARAMS, "run").on("change", () => loop())

// Only available if Chrome is launched with --js-flags="--expose-gc"
const gc = (window as any).gc
if (gc) pane.addButton({ title: "force gc()" }).on("click", () => gc())

const statsFolder = pane.addFolder({ title: "Stats", expanded: true })
const format = (v: number): string => v.toFixed(0)
statsFolder.addBinding(STATS, "pages", { readonly: true, format })
statsFolder.addBinding(STATS, "created", { readonly: true, format })
statsFolder.addBinding(STATS, "collected", { readonly: true, format })
statsFolder.addBinding(STATS, "retained", { readonly: true, format })
if (PARAMS.cache === "Map") {
  statsFolder.addBinding(STATS, "mapSize", { readonly: true, format, label: "Map size" })
}
statsFolder.addBinding(STATS, "memory", { readonly: true })
