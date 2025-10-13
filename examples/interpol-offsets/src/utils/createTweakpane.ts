import { Interpol, InterpolOptions, Timeline } from "@wbe/interpol"
import { Pane } from "tweakpane"

/**
 * Create Tweakpane
 */

export const createTweekpane = (
  itp: Interpol | Timeline,
  PARAMS?: Record<any, any>,
  yoyo?: () => Promise<void>,
): Pane => {
  const pane = new Pane({ title: "Controls", expanded: true })

  /**
   * Controls folder
   */
  const controlsFolder = pane.addFolder({ title: "Controls", expanded: true })

  if (yoyo) controlsFolder.addButton({ title: "yoyo" }).on("click", () => yoyo())
  controlsFolder.addButton({ title: "play" }).on("click", () => itp.play())
  controlsFolder.addButton({ title: "reverse" }).on("click", () => itp.reverse())
  controlsFolder.addButton({ title: "pause" }).on("click", () => itp.pause())
  controlsFolder.addButton({ title: "resume" }).on("click", () => itp.resume())
  controlsFolder.addButton({ title: "stop" }).on("click", () => itp.stop())
  controlsFolder.addButton({ title: "refresh" }).on("click", () => itp.refresh())
  const progressBinding = controlsFolder
    .addBinding({ progress: itp.progress() }, "progress", { min: 0, max: 1 })
    .on("change", (ev) => {
      itp.progress(ev?.value || 0)
    })

  /**
   * Options folder
   */

  if (PARAMS) {
    const optionsFolder = pane.addFolder({ title: "Options", expanded: true })
    if (PARAMS?.duration) {
      optionsFolder
        .addBinding(PARAMS, "duration", { min: 0, max: 10000, step: 100 })
        .on("change", () => {
          itp.refresh()
        })
    }

    const easeNames = ["linear", "power1", "power2", "power3", "power4", "expo"]
    const easeTypes = ["in", "out", "inOut"]
    const eases: Record<string, string> = { linear: "linear" }
    for (const name of easeNames.slice(1)) {
      for (const type of easeTypes) {
        const key = `${name}.${type}`
        eases[key] = key
      }
    }
    if (PARAMS?.ease) {
      optionsFolder.addBinding(PARAMS, "ease", { options: eases }).on("change", () => {
        itp.refresh()
      })
    }
    if (PARAMS?.reverseEase) {
      optionsFolder.addBinding(PARAMS, "reverseEase", { options: eases }).on("change", () => {
        itp.refresh()
      })
    }
  }

  /**
   * DISPLAY folder
   */
  const displayFolder = pane.addFolder({ title: "States", expanded: true })

  // Create reactive object for Interpol properties
  const DISPLAY = {
    duration: itp.duration,
    time: itp.time,
    progress: itp.progress(),
    isPlaying: itp.isPlaying,
    isPaused: itp.isPaused,
    isReversed: itp.isReversed,
  }

  // Add bindings for display (read-only)
  const durationBinding = displayFolder.addBinding(DISPLAY, "duration", { readonly: true })
  const timeBinding = displayFolder.addBinding(DISPLAY, "time", { readonly: true })
  const progressDisplayBinding = displayFolder.addBinding(DISPLAY, "progress", { readonly: true })
  const isPlayingBinding = displayFolder.addBinding(DISPLAY, "isPlaying", { readonly: true })
  const isPausedBinding = displayFolder.addBinding(DISPLAY, "isPaused", { readonly: true })
  const isReversedBinding = displayFolder.addBinding(DISPLAY, "isReversed", { readonly: true })

  // Update function to refresh displayed values
  const updateDisplay = () => {
    DISPLAY.duration = itp.duration
    DISPLAY.time = itp.time
    DISPLAY.progress = itp.progress()
    DISPLAY.isPlaying = itp.isPlaying
    DISPLAY.isPaused = itp.isPaused
    DISPLAY.isReversed = itp.isReversed

    // Refresh the bindings
    durationBinding.refresh()
    timeBinding.refresh()
    progressDisplayBinding.refresh()
    isPlayingBinding.refresh()
    isPausedBinding.refresh()
    isReversedBinding.refresh()

    // Update progress slider
    progressBinding.refresh()
  }

  // Update display on animation frame
  InterpolOptions.ticker.add(() => updateDisplay())

  return pane
}
