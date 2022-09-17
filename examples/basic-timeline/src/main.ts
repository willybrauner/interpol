import "./style.css"
import { Timeline, Interpol, Ease } from "interpol"

const $playButton = document.querySelector<HTMLDivElement>(".play")
const $pauseButton = document.querySelector<HTMLDivElement>(".pause")
const $replayButton = document.querySelector<HTMLDivElement>(".replay")
const $stopButton = document.querySelector<HTMLDivElement>(".stop")

$playButton.addEventListener("click", async () => {
  await tl.play()
  console.log("TL play is complete!")
})
$replayButton.addEventListener("click", async () => {
  await tl.replay()
  console.log("TL replay is complete!")
})
$pauseButton.addEventListener("click", () => tl.pause())
$stopButton.addEventListener("click", () => tl.stop())

const $el = document.querySelector<HTMLDivElement>(".el")
const $el2 = document.querySelector<HTMLDivElement>(".el2")
const $el3 = document.querySelector<HTMLDivElement>(".el3")

const go = new Interpol({
  from: 0,
  to: 100,
  duration: 1160,
  paused: true,
  ease: Ease.inOutQuart,
  onUpdate: ({ value, time, advancement }) => {
    console.log("> go >", { value, time, advancement })
    const x = value
    const y = -((value / go.to) * 100)
    $el.style.transform = `translateX(${x}vw) translateY(${y}vh) translateZ(0)`
  },
  onComplete: ({ value, time, advancement }) => {
    console.log("----------END go >", { value, time, advancement })
  },
})

const back = new Interpol({
  from: 100,
  to: 0,
  duration: 500,
  paused: true,
  onUpdate: ({ value, time, advancement }) => {
    console.log("> back >", { value, time, advancement })
    const x = value
    const y = -((value / back.from) * 100)
    $el.style.transform = `translateX(${x}vw) translateY(${y}vh) translateZ(0)`
  },
  onComplete: ({ value, time, advancement }) => {
    console.log("----------END back >", { value, time, advancement })
  },
})

const tl = new Timeline({onComplete: ()=> { console.log('--- TL complete !') }})
tl.add(go, 0)
tl.add(back, 0)
//tl.add(go, 500)


//await tl.play()
