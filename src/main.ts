import "./style.css"
import Interpol from "./Interpol"
import { Ease } from "./Ease"

const $playButton = document.querySelector<HTMLDivElement>(".play")
const $pauseButton = document.querySelector<HTMLDivElement>(".pause")
const $resumeButton = document.querySelector<HTMLDivElement>(".resume")
const $stopButton = document.querySelector<HTMLDivElement>(".stop")
const $el = document.querySelector<HTMLDivElement>(".el")

const inter = new Interpol({
  from: 0,
  to: 1400,
  duration: 2000,
  delay: 300,
  paused: true,
  ease: Ease.outExpo,
  onUpdate: ({ value, time, advancement }) => {
    console.log({ value, time, advancement })
    const x = advancement * 100
    const y = -((value / inter.to) * 100)
    $el.style.transform = `translateX(${x}vw) translateY(${y}vh) translateZ(0)`
  },
  onComplete: () => {
    $el.style.transform = `translateX(${0}vw) translateY(${0}vh)`
  },
})

$playButton.addEventListener("click", () => {
  inter.play()
})
$pauseButton.addEventListener("click", () => {
  inter.pause()
})
$resumeButton.addEventListener("click", () => {
  inter.resume()
})
$stopButton.addEventListener("click", () => {
  inter.stop()
})
