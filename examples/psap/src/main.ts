import "./index.css"
import { Ease } from "@psap/interpol"
import { gsap } from "gsap"
import { psap } from "@psap/psap"

const $ball = document.querySelector(".ball")

;["play", "reverse", "replay", "pause", "stop"].forEach(
  (name) => (document.querySelector<HTMLButtonElement>(`.${name}`).onclick = () => a[name]())
)
window.addEventListener("keydown", (e) => e.key === " " && a.replay())

// anime({
//   targets: '.css-transforms-demo .el',
//   translateX: 250,
//   scale: 2,
//   rotate: '1turn'
// });

const a = psap.fromTo(
  $ball,
  {
    // x: -40,
    // y: `-20px`,
    //z: 0,
    // rotateY: "0deg",
    scaleY: 2,
  },
  {
    // x: 30,
    // y: `20rem`,
    // rotateY: "100deg",
    scaleY: 10,
    //duration: 0,
    // z: 0,
    //    duration: 1,
    //   paused: true,
    // debug: true,
  }
)
