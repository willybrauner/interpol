import "./index.css"
import { Renderer, Program, Mesh, Transform, Geometry } from "ogl"
import fragment from "./shaders/fragment.glsl?raw"
import vertex from "./shaders/vertex.glsl?raw"
import { Timeline } from "@wbe/interpol"

async function main() {
  const renderer = new Renderer({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const gl = renderer.gl
  document.body.appendChild(gl.canvas)

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener("resize", resize, false)
  resize()

  const scene = new Transform()

  const program = new Program(gl, {
    vertex,
    fragment,
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

  requestAnimationFrame(update)
  function update() {
    requestAnimationFrame(update)
    renderer.render({ scene })
  }

  /**
   * Animate
   */
  const tl = new Timeline({ paused: true })

  tl.add({
    value: [0, 1],
    ease: "expo.out",
    duration: 1000,
    onUpdate: ({ value }) => {
      program.uniforms.uMove.value = value
    },
  })

  const loop = async () => {
    await tl.play()
    await tl.reverse()
    loop()
  }
  loop()
}

main()
