import "./style.css"
import { Timeline, Interpol, Ease } from "interpol"

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

const DURATION = 900

const tl = new Timeline({
  onComplete: () => {
    console.log("Main > Tl onComplete")
  },
})
tl.add(
  {
    from: 0,
    to: 50,
    duration: DURATION,
    paused: true,
    ease: Ease.inOutSine,
    onUpdate: ({ value, time, advancement }) => {
      console.log("Main > GREEN >", { value, time, advancement })
      $el.style.transform = `translateX(${value}vw) translateY(${-value}vh) translateZ(0)`
    },
    onComplete: ({ value, time, advancement }) => {
      console.log("Main > ---------- END GREEN >", { value, time, advancement })
    },
  },
  0
)
tl.add(
  {
    from: 0,
    to: 50,
    duration: DURATION,
    paused: true,
    ease: Ease.inOutSine,
    onUpdate: ({ value, time, advancement }) => {
      console.log("Main > RED >", { value, time, advancement })
      $el2.style.transform = `translateX(${value}vw) translateY(${-value}vh) translateZ(0)`
    },
    onComplete: ({ value, time, advancement }) => {
      console.log("Main > ---------- END RED >", { value, time, advancement })
    },
  },
  0
)
