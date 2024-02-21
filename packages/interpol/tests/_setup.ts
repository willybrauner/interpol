import { InterpolOptions } from "../src"

const runFakeRaf = () => {
  let count = 0
  setInterval(() => {
    InterpolOptions.ticker.raf((count += 16))
  }, 16)
}
runFakeRaf()
InterpolOptions.ticker.disable()
