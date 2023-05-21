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
//
// const a = psap.fromTo(
//   $ball,
//   {
//     // y: `-20px`,
//     //z: 0,
//     // rotateY: "-100deg",
//     rotateY: -100,
//     marginTop: "-10px",
//     x: "-3rem",
//     scaleY: 1,
//   },
//   {
//     // y: `20rem`,
//     // rotateY: "100deg",
//     rotateY: 100,
//     x: "3rem",
//     scaleY: 10,
//     duration: 1,
//
//     marginTop: "110px",
//     //duration: 0,
//     // z: 0,
//     //    duration: 1,
//       paused: true,
//     // debug: true,
//   }
// )

// const a = psap.to($ball, {
//   marginLeft: "100px",
//   opacity: 0.5,
//   scaleX: 2,
//   x: 100,
//   duration: 1,
// })

const a = psap.to($ball, {
  marginLeft: "100px",
  opacity: 0.5,
//  scaleX: 2,
  x: 100,
  duration: 1,
})
