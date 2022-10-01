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

```ts
import { Interpol } from "./Interpol"

const itp = new Interpol({
  paused: true, // disable autoplay
  yoyo: false, // disable yoyo (false by default)
  repeat: 0,
  from: 0,
  to: 100,
  onUpdate: ({ value, time, advancement }) => {
    // ...
  },
  onComplete: ({ value, time, advancement }) => {
    // ...
  },
  onRepeatComplete: ({ value, time, advancement }) => {
    // only if repeat is positive value
    // ...
  },
})

// Play the interpol
// play(): Promise<any>
itp.play().then(() => {
  // itp complete
})

// Pause the interpol
// pause(): void
itp.pause()

// Stop the interpol, will reset time, delta and advancement.
itp.stop()

// Replay from start the interpol.
// replay(): void
itp.replay()

// Reverse and play the interpol
// reverse(): void
itp.reverse()

// Compute 'from' 'to' and 'duration' values if there are functions
// refreshComputedValues(): void
itp.refreshComputedValues()
```

### Timeline constructor

```ts
interface construct {
  // repeat The current Timeline
  // default: `0`
  repeat?: number

  // Execute on frame update
  // default: /
  onUpdate?: ({ time, advancement }) => void

  // Execute on complete
  // default: /
  onComplete?: ({ time, advancement }) => void

  // Execute on all repeats complete
  // default: /
  onRepeatComplete?: () => void

  // Enable @wbe/debug to get interpol instance logs
  // exe in your console `localStorage.debug = "interpol:Timeline"`
  // default: `false`
  debug?: boolean
}
```

### Timeline methods

```ts
import { Timeline } from "./Interpol"

const tl = new Timeline({
  onUpdate: () => {},
  onComplete: () => {},
  onRepeatComplete: () => {},
})
tl.add({
  from: 0,
  to: 100,
  onUpdate: ({ value, time, advancement }) => {
    // ...
  },
})
tl.add({
  from: 10,
  to: 1000,
  onUpdate: ({ value, time, advancement }) => {
    // ...
  },
})

// start the timeline
// Timeline don't have autoplay
// play(): Promise<any>
tl.play()

// paused the timeline
// pause(): void
tl.pause()

// stop
// stop(): void
tl.stop()

// restart the timeline
// replay(): void
tl.replay()

// reverse and play the timeline
// replay(): Promise<any>
tl.reverse()
```

## Dev examples

```shell
# install dependencies
pnpm i

# build and watch lib changes
npm run build:watch

# start tests and watch
npm run test:watch

# start dev server on selected example
npm run dev:interpol-basic
npm run dev:interport-repeat-refresh
npm run dev:interport-reverse-ease
npm run dev:timeline-basic
```

## Credits

- [gsap](https://greensock.com/gsap/)
- [animate](https://github.com/SolalDR/animate/)
- [animini](https://github.com/dbismut/animini)
- [signal](https://github.com/zouloux/signal)
