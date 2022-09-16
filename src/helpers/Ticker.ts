export const RAF =
  typeof window === "undefined"
    ? (cb) => setTimeout(cb, 16)
    : requestAnimationFrame

export const CANCEL_RAF =
  typeof window === "undefined" ? (cb) => {} : cancelAnimationFrame

/**
 * Ticker
 *
 *
 */
export default class Ticker {
  // will contain the timestamp when the experience starts and will stay the same.
  public startTime: number
  // will contain the current timestamp and will change on each frame.
  public currentTime: number
  // will contain how much time was spent since the start of the experience.
  public elapsedTime: number
  // will contain how much time was spent since the previous frame.
  // We set it as 16 by default which is close to how many milliseconds
  //  there is between two frames at 60fps.
  public deltaTime: number
  // store raf
  protected raf

  public start() {
    this.startTime = Date.now()
    this.currentTime = this.startTime
    this.elapsedTime = 0
    this.deltaTime = 16
    this.raf = RAF(this.tick.bind(this))
  }
  public pause() {
    CANCEL_RAF(this.raf)
  }

  public stop() {
    // if (!this.raf) return
    this.elapsedTime = 0
    CANCEL_RAF(this.raf)
    console.log("----------------------------------------------------")
  }

  public onUpdate = (p: {
    delta: number
    time: number
    elapsedTime: number
  }): void => {}

  protected tick() {

    const currentTime = Date.now()
    this.deltaTime = currentTime - this.currentTime
    this.currentTime = currentTime
    this.elapsedTime = this.currentTime - this.startTime

    this.raf = RAF(this.tick.bind(this))

    this.onUpdate?.({
      delta: this.deltaTime,
      time: this.currentTime,
      elapsedTime: this.elapsedTime,
    })
  }
}
