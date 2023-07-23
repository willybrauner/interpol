export type EaseFn = (t: number) => number
type Power = Record<string, EaseFn>

// Power1: Quad
export const Power1: Power = {
  in: (t) => t * t,
  out: (t) => t * (2 - t),
  inOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
}

// Power2: Cubic
export const Power2: Power = {
  in: (t) => t * t * t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
}

// Power3: Quart
export const Power3: Power = {
  in: (t) => t * t * t * t,
  out: (t) => 1 - Math.pow(1 - t, 4),
  inOut: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
}

// Power4: Quint
export const Power4: Power = {
  in: (t) => t * t * t * t * t,
  out: (t) => 1 - Math.pow(1 - t, 5),
  inOut: (t) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2),
}

//  Expo
export const Expo: Power = {
  in: (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  out: (t) => (t === 1 ? 1 : -Math.pow(2, -10 * t) + 1),
  inOut: (t) => {
    if (t === 0) return 0
    if (t === 1) return 1
    if ((t /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (t - 1))
    return 0.5 * (-Math.pow(2, -10 * --t) + 2)
  },
}

export const Linear: EaseFn = (t) => t

/**
 * Adaptor for gsap ease functions as string
 */
// prettier-ignore
export type EaseType = "power1" | "power2" | "power3" | "power4" | "expo" | "Power1" | "Power2" | "Power3" | "Power4" | "Expo"
export type EaseDirection = "in" | "out" | "inOut"
export type EaseName = `${EaseType}.${EaseDirection}` | "Linear" | "linear" | "none"

export const easeAdaptor = (ease: EaseName): EaseFn => {
  let [type, direction] = ease.split(".") as [EaseType, EaseDirection]
  // if first letter is lowercase, capitalize it
  if (type[0] === type[0].toLowerCase()) {
    type = (type[0].toUpperCase() + type.slice(1)) as EaseType
  }
  const e = { Linear, Power1, Power2, Power3, Power4, Expo }
  return e?.[type]?.[direction] ?? Linear
}
