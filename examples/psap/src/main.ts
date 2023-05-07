import "./index.css"
import { psap, Ease } from "@wbe/interpol"

const $ball = document.querySelector(".ball")

;["play", "reverse", "replay", "pause", "stop"].forEach(
  (name) => (document.querySelector<HTMLButtonElement>(`.${name}`).onclick = () => a[name]())
)
window.addEventListener("keydown", (e) => e.key === " " && a.replay())

const a = psap.fromTo(
  $ball,
  {
    x: 0,
    y: `-20px`,
    rotateY: "0deg",
    // z: `16px`,
  },
  {
    x: 30,
    y: `20rem`,
    rotateY: "100deg",
    // z: `18rem`,
    duration: 1,
    ease: Ease.linear,
    debug: true,
  }
)
