import { Interpol } from "@wbe/interpol"
import type { InterpolConstruct, PropsValues } from "@wbe/interpol"
import "./index.less"

/**
 * Query
 */
const $element = document.querySelector<HTMLElement>(".ball")!

const seek0 = document.querySelector<HTMLButtonElement>(".seek-0")
const seek05 = document.querySelector<HTMLButtonElement>(".seek-05")
const seek1 = document.querySelector<HTMLButtonElement>(".seek-1")

const inputProgress = document.querySelector<HTMLInputElement>(".progress")
const inputSlider = document.querySelector<HTMLInputElement>(".slider")

/**
 * Events
 */
;["play", "reverse", "pause", "stop", "refresh", "resume"].forEach(
  (name: any) =>
    (document.querySelector<HTMLButtonElement>(`.${name}`)!.onclick = () => {
      // @ts-ignore
      itp[name]()
    }),
)

seek0!.onclick = () => itp.seek(0, false)
seek05!.onclick = () => itp.seek(0.5, false)
seek1!.onclick = () => itp.seek(1, false)
inputProgress!.onchange = () => itp.seek(parseFloat(inputProgress!.value) / 100, false)
inputSlider!.oninput = () => itp.seek(parseFloat(inputSlider!.value) / 100, false)


/**
 * PSAP type
 */
type InterpolKeys = keyof InterpolConstruct<any>;
type CustomPropsValues = Omit<PropsValues, InterpolKeys>;

const psap = (
  el: HTMLElement | HTMLElement[],
  options: InterpolConstruct<any> & { [x:string]: CustomPropsValues }
) => {

  const OptionsWithoutProps = {
    duration: options?.duration ?? 1000,
    ease: options?.ease ?? "linear",
    reverseEase: options?.reverseEase ?? "linear",
    paused: options?.paused ?? false,
    immediateRender: options?.immediateRender ?? false,
    delay: options?.delay ?? 0,
    debug: options?.debug ?? false,
    beforeStart: options?.beforeStart ?? (()=> {}),
    onUpdate: options?.onUpdate ?? (()=> {}),
    onComplete: options?.onComplete ?? (()=> {}),
  }

  // in options, get all keys that are not in OptionsWithoutProps
  const props = Object.keys(options).reduce((acc, key) => {
    if (!Object.keys(OptionsWithoutProps).includes(key)) acc[key] = options[key]
    return acc
  }, {} as Record<string, PropsValues>)


  return new Interpol({ el, props, ...OptionsWithoutProps })
}

/**
 * Use a simple psap
 */
const itp = psap($element, {
  x: [0, 100, "px"],
  y: { from: 0, to: 100, unit:"px", ease: "power1.in"},
  ease: "power3.out",
  paused: true,
  onComplete: ({x}, time, props, instance) => {

  }
})

itp.play()

