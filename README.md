# Interpol 👮🏽‍

interpol library interpolate value between two points.
This is the lowest level of animate machine.
Interpol is not a DOM API, it provides a real time advancement of the interpolation that can be use or bind
on... anything!

## Why

I've been using gsap for a long time, but often don't need all the features provided.
Interpol is low level, it can be used as in most cases for only ~= 3k gzip.
However, the API voluntarily takes over (in part) the gsap API for easier adoption for gsap users like me.

## Show me some code

Single Interpol:

```js
import { Interpol } from "@wbe/interpol"

const itp = new Interpol({
  from: 0,
  to: 100,
  duration: 1000,
  onUpdate: ({ time, value, advancement }) => {},
  onComplete: () => {},
})
```

Chain interpols with Timeline:

```js
import { Interpol, Timeline } from "@wbe/interpol"

const itp1 = new Interpol({
  from: 0,
  to: 100,
  duration: 1000,
})
const itp2 = new Interpol({
  from: 0,
  to: 500,
  duration: 7000,
})

const tl = new Timeline()
tl.add(itp1)
tl.add(itp2)
```

## API

### interpol constructor

```ts
interface IInterpolConstruct {
  // Start interpolation value (millisecond)
  // default: `0`
  from?: number | (() => number)

  // End interpolation value (millisecond)
  // default: /
  to?: number | (() => number)

  // Interpolation duration between `from` and `to` values (millisecond).
  // ex: 1000 is 1 second
  // default: `1000`
  duration?: number | (() => number)

  // Interpol easing function
  // default: `t => t` (lineal easing)
  ease?: (t: number) => number

  // Overwrite easing function on reverse
  // default: `t => t` (lineal easing)
  reverseEase?: (t: number) => number

  // Make interpol paused at start (not autoplay)
  // default: `false`
  paused?: boolean

  // Add delay before first start
  // default: `false`
  delay?: number

  // Reverse and replay indefinitely at interpol end
  // default: `false`
  yoyo?: boolean

  // Repeat N times. If value is negative, it repeats indefinitly
  // default: `0`
  repeat?: number

  // Refresh computed values before each repeats
  // default: `false`
  repeatRefresh?: boolean

  // Enable @wbe/debug to get interpol instance logs
  // exe in your console `localStorage.debug = "interpol:*"`
  // default: `false`
  debug?: boolean

  // Execute code before start
  // default: /
  beforeStart?: () => void

  // Execute code on each play start
  // default: /
  onStart?: () => void

  // Execute code on frame update
  // default: /
  onUpdate?: ({ value, time, advancement }: IUpdateParams) => void

  // Execute code when interpol is complete
  // default: /
  onComplete?: ({ value, time, advancement }: IUpdateParams) => void

  // Execute code when each interpol repeats are complete
  // default: /
  onRepeatComplete?: ({ value, time, advancement }: IUpdateParams) => void
}
```

### Interpol methods

#### play(): Promise<any>

Play the current interpol

#### pause(): void

Pause the current interpol

#### stop(): void

Stop the current interpol, will reset time, delta and advancement.

#### replay(): void

Replay from start the current interpol.

#### reverse(): void

Reverse the current interpol

#### refresh(): void

Compute from to and duration values if there are functions

### Timeline constructor

### Timeline methods

## Credits

- [gsap](https://greensock.com/gsap/)
- [animate](https://github.com/SolalDR/animate/)
- [signal](https://github.com/zouloux/signal)
