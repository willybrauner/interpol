import "./index.css"
import { psap, Ease } from "@wbe/interpol"

const $ball = document.querySelector(".ball")

;["play", "reverse", "replay", "pause", "stop"].forEach(
  (name) => (document.querySelector<HTMLButtonElement>(`.${name}`).onclick = () => a[name]())
)

const a = psap.fromTo(
  $ball,
  {
    x: "-10rem",
  },
  {
    x: 20,
    duration: 1,
    ease: Ease.inOutCubic,
    debug: true,
  }
)
