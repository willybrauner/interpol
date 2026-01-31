import "./index.css"
import { EaseName, interpol, InterpolOptions } from "@wbe/interpol"
import { Renderer, Program, Mesh, Transform, Geometry } from "ogl"
import { createTweekpane } from "./utils/createTweakpane"

const renderer = new Renderer({ width: window.innerWidth, height: window.innerHeight })
const gl = renderer.gl
document.body.appendChild(gl.canvas)

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const scene = new Transform()

const program = new Program(gl, {
  vertex: /* glsl */ `
      attribute vec2 uv;
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
          vUv = uv;
          gl_Position = vec4(position, 0, 1);
      }
    `,
  fragment: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float uMove;
      void main() {
          float strength = floor(vUv.y * 15. * uMove) / 15.;
          gl_FragColor = vec4(vec3(strength), 1.);
      }
    `,
  transparent: true,
  uniforms: {
    uMove: { value: 0 },
  },
})

const geometry = new Geometry(gl, {
  position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
  uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
})

const mesh = new Mesh(gl, { geometry, program })
mesh.setParent(scene)

InterpolOptions.ticker.add(() => {
  renderer.render({ scene })
})

const PARAMS = {
  duration: 1000,
  ease: "power2.out",
}

/**
 * interpol
 */
const itp = interpol({
  value: [0, 1],
  ease: () => PARAMS.ease as EaseName,
  duration: () => PARAMS.duration,
  onUpdate: ({ value }) => {
    program.uniforms.uMove.value = value
  },
})

const yoyo = async () => {
  await itp.play()
  await itp.reverse()
  yoyo()
}
yoyo()
createTweekpane(itp, PARAMS, yoyo)
