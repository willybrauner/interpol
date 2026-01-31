import { it, expect, vi, describe } from "vitest"
import { timeline } from "../src"
import "./_setup"

describe.concurrent("timeline auto refresh computed values", () => {
  it("adds computed values should be re-calc before add stars", () => {
    /**
     * Goal is to update EXTERNAL_X on the first add() onUpdate and reused the updated EXTERNAL_X
     * as "from" of the second add().
     *
     * It will work if "from" of the second add() is a computed value
     * Behind the scene, we re-execute refresh() juste before the add() starts
     */
    const tl = timeline({ paused: true })
    let EXTERNAL_X = 0
    const firstAddTo = 200
    const secondAddTo = 30
    let firstOnUpdate = true

    tl.add({
      duration: 100,
      x: [0, firstAddTo],
      onUpdate: ({ x }) => {
        // register the external value
        EXTERNAL_X = x
      },
    })
    tl.add({
      duration: 100,
      x: [() => EXTERNAL_X, secondAddTo],
      onUpdate: ({ x }, t, p, instance) => {
        if (firstOnUpdate) {
          expect(EXTERNAL_X).toBe(firstAddTo)
          expect(instance.props.x._from).toBe(firstAddTo)
          firstOnUpdate = false
        }
        // register the external value
        EXTERNAL_X = x
      },
      onComplete: () => {
        expect(EXTERNAL_X).toBe(secondAddTo)
      },
    })
    return tl.play()
  })

  it("adds values should NOT be refresh before add stars", () => {
    const tl = timeline({ paused: true })
    let EXTERNAL_X = 0
    let firstOnUpdate = true

    tl.add({
      duration: 100,
      x: [0, 200],
      onUpdate: ({ x }) => {
        // register the external value
        EXTERNAL_X = x
      },
    })
    tl.add({
      duration: 100,
      x: [EXTERNAL_X, 30],
      onUpdate: ({ x }, time, progress, instance) => {
        if (firstOnUpdate) {
          // _from as not been computed before the 1st add() starts
          expect(instance.props.x._from).toBe(0)
          firstOnUpdate = false
        }
      },
    })
    return tl.play()
  })
})
