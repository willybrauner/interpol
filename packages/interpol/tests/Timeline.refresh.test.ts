import { it, expect, vi, describe } from "vitest"
import { Timeline } from "../src"
import "./_setup"

describe.concurrent("Timeline auto refresh computed values", () => {
  it("adds computed values should be re-calc before add stars", () => {

    /**
     * Goal is to update EXTERNAL_X on the first add() onUpdate and reused the updated EXTERNAL_X
     * as "from" of the second add().
     *
     * It will work if "from" of the second add() is a computed value
     * Behind the scene, we re-execute refreshComputedValues() juste before the add() starts
     */
    const tl = new Timeline({ paused: true })
    let EXTERNAL_X = 0
    const firstAddTo = 200
    const secondAddTo = 30
    let firstOnUpdate = true

    tl.add({
      duration: 100,
      props: {
        x: [0, firstAddTo]
      },
      onUpdate: ({ x }) => {
        // register the external value
        EXTERNAL_X = parseFloat(x)
      }
    })
    tl.add({
      duration: 100,
      props: {
        x: [() => EXTERNAL_X, secondAddTo]
      },
      onUpdate: ({ x }) => {
        if (firstOnUpdate) {
          expect(EXTERNAL_X).toBe(firstAddTo)
          firstOnUpdate = false
        }
        // register the external value
        EXTERNAL_X = parseFloat(x)
      },
      onComplete: () => {
        expect(EXTERNAL_X).toBe(secondAddTo)
      }
    })
    return tl.play()
  })

})
