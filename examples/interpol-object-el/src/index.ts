import "./index.css"
import { Renderer, Plane, Program, Mesh, Transform, Camera } from "ogl"
import fragment from "./shaders/fragment.glsl?raw"
import vertex from "./shaders/vertex.glsl?raw"
import { Interpol } from "@wbe/interpol"

main()
async function main() {
  const renderer = new Renderer()
  const gl = renderer.gl
  document.body.appendChild(gl.canvas)

  const camera = new Camera(gl)
  camera.position.z = 2

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.perspective({ aspect: gl.canvas.width / gl.canvas.height })
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

  const geometry = new Plane(gl, {
    width: 1,
    height: 1,
    widthSegments: 32,
    heightSegments: 32,
  })

  const mesh = new Mesh(gl, { geometry, program })
  mesh.setParent(scene)

  requestAnimationFrame(update)
  function update() {
    requestAnimationFrame(update)
    renderer.render({ scene, camera })
  }

  /**
   * Use object as element
   */
  const playIn = () => {
    new Interpol({
      el: program.uniforms.uMove,
      props: {
        value: [0, 1],
      },
      ease: "expo.out",
      duration: 2000,

      // no need to use onUpdate callback
      // onUpdate: ({ value }) => {
      //   program.uniforms.uMove.value = value;
      // },
    })
  }
  playIn()
}
