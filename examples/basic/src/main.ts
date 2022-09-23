import "./style.css"
import { Interpol, Ease } from "../../../src"

const $playButton = document.querySelector<HTMLDivElement>(".play")
const $pauseButton = document.querySelector<HTMLDivElement>(".pause")
const $replayButton = document.querySelector<HTMLDivElement>(".replay")
const $stopButton = document.querySelector<HTMLDivElement>(".stop")
const $reverseButton = document.querySelector<HTMLDivElement>(".reverse")

$playButton.addEventListener("click", async () => {
  await inter.play()
  console.log(" after await play is complete!")
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
  to: 1000,
  duration: 900,
  delay: 0,
  paused: true,
  ease: Ease.outExpo,
  //  yoyo: true,
  repeat: 3,
  debug: true,
  onUpdate: ({ value, time, advancement }) => {
    const x = advancement * 100
    const y = -value / 10
    $el.style.transform = `translateX(${x}vw) translateY(${y}vh) translateZ(0)`
  },
  onComplete:()=> {
    console.log('icicicicici complete')
  }
})
