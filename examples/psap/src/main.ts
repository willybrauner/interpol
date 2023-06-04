import "./index.css"
import { gsap } from "gsap"
import { psap } from "@psap/psap"

function randomRange(min: number, max: number, decimal = 0): number {
  const rand = Math.random() * (max - min + 1) + min
  const power = Math.pow(10, decimal)
  return Math.floor(rand * power) / power
}

const $wrapper = document.querySelector(".wrapper")
// clone and append new node in wrapper
for (let i = 0; i < 1; i++) {
  const el = document.querySelector(".ball")
  const $clone = el.cloneNode(true)
  $wrapper.appendChild($clone)
}
const $button = document.querySelector(".button")
const $ball = document.querySelectorAll(".ball")

;["play", "reverse", "replay", "pause", "stop", "refresh"].forEach(
  (name) => (document.querySelector<HTMLButtonElement>(`.${name}`).onclick = () => a[name]())
)

// -----------------------------------------------------------------------------

const a = psap.timeline()
a.to($ball[0], {
  //margin: "10px",
  x: 200,
  ease: "power2.inOut",
  duration: 1,
})
a.to($ball[0], {
  y: 200,
  ease: "power4.out",
  duration: 1,
})
// tl.to($ball, {
//   x: 100,
//   y: 100,
//   duration: 1.2
// })

// const a = psap.to($ball, {
//   y: () => randomRange(-400, 400),
//   x: () => randomRange(-400, 400),
//   duration: 1,
//   stagger: 0.001,
//   ease: "power2.inOut",
// })
//
// await a.play()

// const obj = { coucou: 0 }
// const a = psap.to(obj, {
//   coucou: 100,
//   onUpdate: () => {
//     console.log(obj.coucou)
//   },
//   //  y: () => randomRange(-200, 200),
//   duration: 1,
//   //    stagger: 0.01,
// })

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
//     rotateY: () => randomRange(-100, 100),
//     marginTop: "-10px",
//     x: () => randomRange(-100, 100),
//     scaleY: 1,
//   },
//   {
//     rotateY: () => randomRange(-100, 100),
//     x: () => randomRange(-100, 100),
//     scaleY: 10,
//     marginTop: "110px",
//     duration: 1,
//   }
// )

// const a = psap.to($ball, {
//   // marginLeft: "100px",
//   scale: () => randomRange(0.5, 5),
//   x: () => randomRange(-100, 100),
//   y: () => randomRange(-100, 100),
//   ease: Ease.inOutCubic,
//   // x: 100,
//   //  duration: 0.5,
//   //  ease: Ease.inCubic,
// })

// const a = psap.to($ball, {
//   marginLeft: "100px",
//   opacity: 0.5,
//   x: 100,
//   duration: 1,
// })
