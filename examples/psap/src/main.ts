import "./index.css"
import { Ease } from "@psap/interpol"
import { gsap } from "gsap"
import { psap } from "@psap/psap"

function randomRange(min: number, max: number, decimal = 0): number {
  const rand = Math.random() * (max - min + 1) + min
  const power = Math.pow(10, decimal)
  return Math.floor(rand * power) / power
}
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
//

// const a = psap.fromTo(
//   $ball,
//   {
//     rotateY: -100,
//     marginTop: "-10px",
//     x: "-3rem",
//     scaleY: 1,
//   },
//   {
//     rotateY: 100,
//     x: "3rem",
//     scaleY: 10,
//     marginTop: "110px",
//     duration: 1,
//   }
// )

const a = psap.set($ball, {
  // marginLeft: "100px",
  opacity: 0.5,
  scale: () => randomRange(1, 10),
  // x: 100,
  //  duration: 0.5,
  //  ease: Ease.inCubic,
})

// const a = psap.to($ball, {
//   marginLeft: "100px",
//   opacity: 0.5,
//   x: 100,
//   duration: 1,
// })
