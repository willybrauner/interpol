import "./index.css"
import { psap } from "@psap/psap"
import { Ease } from "@psap/interpol"

const $ball = document.querySelector(".ball")

;["play", "reverse", "replay", "pause", "stop"].forEach(
  (name) => (document.querySelector<HTMLButtonElement>(`.${name}`).onclick = () => a[name]())
)
window.addEventListener("keydown", (e) => e.key === " " && a.replay())

const a = psap.fromTo(
  $ball,
  {
    x: -40,
    y: `-20px`,
    z: 0,
    rotateY: "0deg",
  },
  {
    x: 30,
    y: `20rem`,
    rotateY: "100deg",
    z: 0,
    duration: 1,
    ease: Ease.linear,
    debug: true,
  }
)
