import "./style.css"
import { Interpol, Ease } from "interpol"

const $playButton = document.querySelector<HTMLDivElement>(".play")
const $pauseButton = document.querySelector<HTMLDivElement>(".pause")
const $replayButton = document.querySelector<HTMLDivElement>(".replay")
const $stopButton = document.querySelector<HTMLDivElement>(".stop")

$playButton.addEventListener("click", async () => {
  await inter.play()
  console.log("play is complete!")
})
$replayButton.addEventListener("click", async () => {
  await inter.replay()
  console.log("replay is complete!")
})

$pauseButton.addEventListener("click", () => inter.pause())
$stopButton.addEventListener("click", () => inter.stop())

const $el = document.querySelector<HTMLDivElement>(".el")

const inter = new Interpol({
  from: 0,
  to: 1400,
  duration: 1300,
  delay: 0,
  paused: true,
  ease: Ease.outExpo,
  onUpdate: ({ value, time, advancement }) => {
    console.log({ value, time, advancement })
    const x = advancement * 100
    const y = -((value / inter.to) * 100)
    $el.style.transform = `translateX(${x}vw) translateY(${y}vh) translateZ(0)`
  },
})
