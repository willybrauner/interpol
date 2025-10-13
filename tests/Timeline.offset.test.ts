import { it, expect, describe } from "vitest"
import { engine, Timeline } from "../src"
import "./_setup"
import { afterEach } from "node:test"
import { expectToBeBetween } from "./utils/expectToBeBetween"

/**
 * Template for testing offset
 * @param itps
 * @param tlDuration
 */
const testTemplate = (itps: [number, (number | string)?][], tlDuration: number) =>
  new Promise(async (resolve: any, reject) => {
    const tl = new Timeline({
      onComplete: (time) => {
        // We are testing the final time / final tlDuration
        // It depends on itps duration and offset

        try {
          expect(time).toBe(tlDuration)
          resolve()
        } catch (error) {
          reject(error)
        }
      },
    })
    for (let [duration, offset] of itps) {
      tl.add({ duration, v: [0, 100] }, offset)
    }
  })

/**
 * Tests
 */
// prettier-ignore
describe.concurrent("Timeline.add() offset", () => {
  it("relative offset should work with `0` (string)", () => {
    return Promise.all([
      testTemplate([[100], [100], [100]], 300),
      testTemplate([[100], [100, "0"], [100, "0"]], 300),
    ])
  })

  it("relative offset should work with string -= or -", () => {
    return Promise.all([
      /**
       0             100           200           300
       [- itp1 (100) -]
               [- itp2 (100) -]
               ^
               offset start at relative "-50" (string)
                             ^
                             total duration is 150
       */
      testTemplate([[100], [100, "-=50"]], 150),

      testTemplate([[100], [100, "-50"]], 150),
      testTemplate([[100], [100, "-=50"], [100, "-=10"]], 240),
      testTemplate([[100], [100, "-=50"], [100, "0"]], 250),
    ])
  })

  it("relative offset should work with string += or +", () => {
    return Promise.all([
      /**
       0             100           200           300
       [- itp1 (100) -]
                             [- itp2 (100) -]
                             ^
                             offset start at relative "+=50" (string)
                                           ^
                                           total duration is 250
       */
      testTemplate([[100], [100, "+=50"]], 250),
      testTemplate([[100], [100, "+50"]], 250),
      testTemplate([[100], [100, "50"]], 250),
      testTemplate([[100], [100, "10"], [100, "50"]], 360),
      testTemplate([[500], [100, "10"], [100, "50"], [100]], 860),
    ])
  })

  it("relative offset should work with negative value", () => {
    return Promise.all([
      testTemplate([[50, "-50"]], 0),
      testTemplate([[50, "-=50"]], 0),
      testTemplate([[50, "-=50"],[100, "-=50"]], 50),
      testTemplate([[50, "-=50"],[100, "-100"]], 0),

      /**
        -100         0            100           200           300
                     [--- itp1 (150) ----]
                     ^ offset start at relative "0" (string)

                < - - - - - - - - - - - -|  (itp2 negative offset "-200")
               [--- itp2 (150) ----]
                                         ^ total TL duration is 150
       */
      testTemplate([[150, "0"],[150, "-200"]], 150),
    ])
  })

  it("absolute offset should work with number", () => {
    // prettier-ignore
    return Promise.all([

      // when absolute offset of the second add is 0
      /**
       0             100           200           300
       [- itp1 (100) -]
       [ ------- itp2 (200) -------- ]
       ^
       offset start at absolute 0 (number)
                                     ^
                                      total duration is 200
       */
      testTemplate([[100], [200, 0]], 200),


      // when absolute offset is greater than the second add duration
      /**
        0             100           200           300           400
                                                  [- itp1 (100) -]
                                                  ^
                                                  offset start at absolute 300 (number)
        [ ------------- itp2 (300) -------------- ]
        ^
        offset start at absolute 0 (number)
                                                                 ^
                                                                 total duration is 400
       */
      testTemplate([[100, 300], [300, 0]], 400),
      testTemplate([[100, 0], [100]], 200),
      testTemplate([[100], [100, 0]], 100),
      testTemplate([[100, 0], [100, 50]], 150),
      testTemplate([[100], [200, 0], [200, 0], [200, 0], [200, 0], [200, 0]], 200),
      testTemplate([[100, 200], [400, 0]], 400),
    ])
  })

  it("absolute offset should work with negative number", () => {
    return Promise.all([
      /**
             0            100           200           300
       [- itp1 (100) -]
       ^
       offset start at absolute -50 (number)
                     ^
                     total duration is 50
      */
      testTemplate([[100, -50]], 50),
      testTemplate([[50, -50]], 0),
      testTemplate([[0, 0]], 0),
      testTemplate([[150, -50]], 100),
    ])
  })

  afterEach(()=> {
    engine.durationFactor = 1
    engine.duration = 1000  
  })


  /**

     0             100           200        300
                    [- itp1     -]
                           [- itp2    -]
                                 [- itp3    -]
     [- itp4  -]

   */
  it('absolute & relative offsets should work together', async () => {
    return new Promise<void>((resolve, reject) => {
      const tl = new Timeline({
        paused: true,
        onComplete: (time) => {
          try {
            expect(tl.time).toBe(300)
            resolve()
          } catch (error) {
            reject(error)
          }
        },
      })

      // Absolute from 100 ms
      tl.add({ 
         duration: 100,
        onComplete: () => {
          console.log('itp 1 time should be 200', tl.time)
          try {
            expectToBeBetween(tl.time, 190, 210)
          } catch (error) {
            reject(error)
          }
        }
      }, 100) 

      // Relative from the previous add, will start at 100 - 50
      tl.add({ 
        duration: 100,
        onComplete: () => {
          try {
            expectToBeBetween(tl.time, 240, 260)
          } catch (error) {
            reject(error)
          }
        }
      }, '-=50') 

      // Relative from the previous add
      tl.add({ 
        duration: 100,
        onComplete: () => {
          try {
            expect(tl.time).toBe(300)
          } catch (error) {
            reject(error)
          }
        }
      }, '-=50') 
    
      // Absolute from 0
      tl.add({ 
        duration: 100,
        onComplete: () => {
          try {
            expectToBeBetween(tl.time, 100, 120)
          } catch (error) {
            reject(error)
          }
        }
      }, 0) 
      

      tl.play().catch(reject)
    })
  })

  it('should work with duration factor on relative offset', async() => {
    engine.durationFactor = 1000
    engine.duration = 1
    const tl = new Timeline({
      paused: true,
      onComplete: (time) => {
        expect(time).toBe(300)
      },
    })
    tl.add({ duration: .2 })
    // start .1 in advance before the first add finishes
    tl.add({ duration: .2 }, '-=.1')
     return tl.play()
  })
  it('should work with duration factor on absolute offset', async() => {
    engine.durationFactor = 1000
    engine.duration = 1
    const tl = new Timeline({
      paused: true,
      onComplete: (time) => {
        expect(time).toBe(300)
      },
    })
    tl.add({ duration: .2 })
    // start .1 after the first add
    tl.add({ duration: .2 }, .1)
     return tl.play()
  })

})
