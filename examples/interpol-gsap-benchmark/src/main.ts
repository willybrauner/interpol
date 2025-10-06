import "./style.css"
import { Interpol, styles } from "@wbe/interpol"
import { randomRGB, random } from "./utils"
import { gsap } from "gsap"
import Stats from "stats-gl"
import { Pane } from "tweakpane"

const PARAMS = {
  testType: "GSAP" as "Interpol" | "GSAP",
  isRunning: false,
  multiple: 6,
}

const app = document.getElementById("app")!
const appRect = app.getBoundingClientRect()

let NUM = Math.pow(PARAMS.multiple, 4)

const _removeAllElements = (): void => {
  app.innerHTML = ""
}
const _createOneElement = (): HTMLElement => {
  const el = document.createElement("div")
  el.className = "element"
  app.appendChild(el)
  return el
}

const _getElementPosition = (i: number) => {
  const margin: number = 3
  const colNumber = Math.sqrt(NUM)
  const ballSize = appRect.width / colNumber - margin
  const col = i % colNumber
  const initial = {
    x: (col / (colNumber - 1)) * (appRect.width - ballSize),
    y: Math.floor(i / colNumber) * ((appRect.height - ballSize) / (colNumber - 1)),
  }

  return { initial, ballSize }
}

/**
 * Interpol
 * @returns
 */
const interpolTest = () => {
  _removeAllElements()
  const itps: Interpol[] = []

  for (let i = 0; i < NUM; i++) {
    const el = _createOneElement()
    const { initial, ballSize } = _getElementPosition(i)

    styles(el, { background: randomRGB(), width: ballSize + "px", height: ballSize + "px" })
    const offset = 800
    const itp = new Interpol({
      paused: true,
      immediateRender: true,
      duration: () => 3000,
      x: [initial.x, () => random(initial.x - offset, initial.x + offset)],
      y: [initial.y, () => random(initial.y - offset, initial.y + offset)],
      rotate: { from: 0, to: random(-720, 720) },
      ease: "power1.inOut",
      onUpdate: ({ x, y, rotate }) => {
        styles(el, { x, y, rotate })
      },
    })

    itps.push(itp)
  }

  const loop = async () => {
    await Promise.all(itps.map((e) => e.play()))
    await Promise.all(itps.map((e) => e.reverse()))
    loop()
  }

  return {
    loop,
    stop: () => itps.forEach((e) => e.stop()),
  }
}

/**
 * GSAP
 * @returns
 */
const gsapTest = () => {
  _removeAllElements()
  const itps: gsap.core.Tween[] = []

  for (let i = 0; i < NUM; i++) {
    const el = _createOneElement()
    const { initial, ballSize } = _getElementPosition(i)
    styles(el, { background: randomRGB(), width: ballSize + "px", height: ballSize + "px" })

    const offset = 800
    const tween = gsap.fromTo(
      el,
      {
        x: initial.x,
        y: initial.y,
        rotate: 0,
      },
      {
        immediateRender: true,
        paused: true,
        duration: 3,
        repeat: -1,
        yoyo: true,
        x: () => random(initial.x - offset, initial.x + offset),
        y: () => random(initial.y - offset, initial.y + offset),
        rotate: () => random(-720, 720),
        ease: "power1.inOut",
      },
    )
    itps.push(tween)
  }

  return {
    loop: () => itps.forEach((itp) => itp.play()),
    stop: () => itps.forEach((itp) => itp.kill()),
  }
}

// --------------------------------------------------------------------------------------- STATS

// create a new Stats object
const stats = new Stats({
  trackGPU: true,
  trackHz: true,
  trackCPT: false,
  logsPerSecond: 4,
  graphsPerSecond: 30,
  samplesLog: 40,
  samplesGraph: 10,
  precision: 2,
  horizontal: false,
  minimal: false,
  mode: 0,
})

// append the stats container to the body of the document
document.body.appendChild(stats.dom)
// begin the performance monitor
stats.begin()

gsap.ticker.add(() => {
  // when all the passes are drawn update the logs
  stats.update()
})

// --------------------------------------------------------------------------------------- TWEAKPANE

let CURRENT: any = null
const pane = new Pane({
  title: "bench",
  expanded: true,
})

pane
  .addBinding(PARAMS, "testType", {
    options: {
      Interpol: "Interpol",
      GSAP: "GSAP",
    },
  })
  .on("change", (ev) => {
    if (PARAMS.isRunning) {
      stopTest()
      startTest()
    }
  })

pane
  .addBinding(PARAMS, "multiple", { min: 2, max: 8, step: 1, label: "pow(x, 4)" })
  .on("change", (ev) => {
    NUM = Math.pow(PARAMS.multiple, 4)
    if (PARAMS.isRunning) {
      stopTest()
      startTest()
    }
  })

const controlFolder = pane.addFolder({ title: "Controls" })
controlFolder.addButton({ title: "Start Loop" }).on("click", startTest)
controlFolder.addButton({ title: "Stop" }).on("click", stopTest)

function startTest() {
  stopTest()
  console.log(`Starting ${PARAMS.testType} test with ${NUM} elements`)
  if (PARAMS.testType === "Interpol") CURRENT = interpolTest()
  if (PARAMS.testType === "GSAP") CURRENT = gsapTest()

  CURRENT.loop()
  PARAMS.isRunning = true
}

function stopTest() {
  if (CURRENT && CURRENT.stop) {
    CURRENT.stop()
  }
  CURRENT = null
  PARAMS.isRunning = false
}

startTest()
