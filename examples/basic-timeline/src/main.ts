import "./style.css"
import { Timeline, Interpol, Ease } from "../../../src"

const $playButton = document.querySelector<HTMLDivElement>(".play")
const $pauseButton = document.querySelector<HTMLDivElement>(".pause")
const $replayButton = document.querySelector<HTMLDivElement>(".replay")
const $stopButton = document.querySelector<HTMLDivElement>(".stop")

$playButton.addEventListener("click", async () => {
  await tl.play()
  console.log("Main > TL play is complete!")
})
$replayButton.addEventListener("click", async () => {
  await tl.replay()
  console.log("TL replay is complete!")
})
$pauseButton.addEventListener("click", () => tl.pause())
$stopButton.addEventListener("click", () => tl.stop())

const $el = document.querySelector<HTMLDivElement>(".el")
const $el2 = document.querySelector<HTMLDivElement>(".el2")
const DURATION = 1000

/**
 * Create Interpol
 */
const interpol1 = new Interpol({
  from: 0,
  to: 50,
  duration: DURATION,
  ease: Ease.inOutQuad,
  onUpdate: ({ value, time, advancement }) => {
    $el.style.transform = `translateX(${value}vw) translateY(${-value}vh) translateZ(0)`
  },
  onComplete: ({ value, time, advancement }) => {
    //  console.log("Main -> END GREEN >", { value, time, advancement })
  },
})
const interpol2 = new Interpol({
  from: 0,
  to: 50,
  paused: true,
  duration: DURATION,
  ease: Ease.outCubic,
  onUpdate: ({ value, time, advancement }) => {
    $el2.style.transform = `translateX(${value}vw) translateY(${
      -value * 1.6
    }vh) translateZ(0)`
  },
  onComplete: ({ value, time, advancement }) => {
    //  console.log("Main -> END RED >", { value, time, advancement })
  },
})

/**
 * Start TL
 */
const tl = new Timeline({ debug: true })
tl.add(interpol1, 0)
tl.add(interpol2, -700)
