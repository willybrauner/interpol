import "./style.css"
import { Interpol, Ease } from "../../../src"

const $playButton = document.querySelector<HTMLDivElement>(".play")
const $pauseButton = document.querySelector<HTMLDivElement>(".pause")
const $replayButton = document.querySelector<HTMLDivElement>(".replay")
const $stopButton = document.querySelector<HTMLDivElement>(".stop")
const $reverseButton = document.querySelector<HTMLDivElement>(".reverse")

$playButton.addEventListener("click", async () => {
  await inter.play()
  console.log("Main >>>>>>>>>>>> after await play is complete!")
})

$replayButton.addEventListener("click", async () => {
  await inter.replay()
  console.log("replay is complete!")
})
$pauseButton.addEventListener("click", () => inter.pause())
$stopButton.addEventListener("click", () => inter.stop())
$reverseButton.addEventListener("click", () => inter.reverse())
const $el = document.querySelector<HTMLDivElement>(".el")

const inter = new Interpol({
  from: 0,
  to: innerHeight / 2,
  duration: 900,
  paused: true,
  ease: Ease.inExpo,
  //  yoyo: true,
  // repeat: 2,
  debug: true,
  beforeStart: () => {
    $el.style.opacity = "0.2"
    $el.style.transform = `translateX(${11}vw) translateY(${-11}vh) translateZ(0)`
  },
  onUpdate: ({ value, time, advancement }) => {
    const x = advancement * 90
    const y = -value / 20
    $el.style.opacity = `${advancement}`
    $el.style.transform = `translateX(${x}vw) translateY(${y}vh) translateZ(0)`
  },
  onComplete: () => {
    console.log("Main > complete()=> {} ")
  },
})
