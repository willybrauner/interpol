<h1 align="center" style="text-align:center">Interpol 👮🏽‍</h1>
<p align="center">
    <img alt="logo" src="./packages/interpol/logo.jpg">
</p>

interpol library interpolates value between two points.
This is the lowest level of animate machine.
Interpol is not a DOM API, it provides real time progress of the interpolation that can be use or bind
on... anything!

## Install

```shell
$ npm i @wbe/interpol
```

## Show me some code

Single Interpol:

```js
import { Interpol } from "@wbe/interpol"

const itp = new Interpol({
  from: 0,
  to: 100,
  duration: 1000,
  onUpdate: ({ time, value, progress }) => {},
  onComplete: () => {},
})
```

[interpol codesandbox](https://codesandbox.io/p/sandbox/interpol-basic-9n9u54)

Chain interpols with Timeline:

```js
import { Interpol, Timeline } from "@wbe/interpol"

const itp1 = new Interpol({
  from: 0,
  to: 100,
  duration: 1000,
  onUpdate: ({ time, value, progress }) => {
    // ...
  },
})
const itp2 = new Interpol({
  from: 0,
  to: 500,
  duration: 7000,
  onUpdate: ({ time, value, progress }) => {
    // ...
  },
})

const tl = new Timeline()
tl.add(itp1)
tl.add(itp2)

tl.play()
```

Advanced timeline:

```js
import { Timeline } from "@wbe/interpol"

const tl = new Timeline({
  onUpdate: ({ time, value, progress }) => {
    // global timeline update
  },
  onComplete: () => {
    // timeline is complete!
  },
  // enable @wbe/debug on this timeline by adding `localStorage.debug = "interpol:*"`
  // in your browser's console
  debug: true,
})

// `add` method can recieve an interpol object without creat an interpol instance
tl.add({
  from: 0,
  to: 100,
  duration: 1000,
  onUpdate: ({ time, value, progress }) => {
    // here is current interpol update
  },
})
tl.add(
  {
    from: -100,
    to: 100,
    duration: 500,
    onUpdate: ({ time, value, progress }) => {
      // current interpol update
    },
  },
  // set a negatif offsetDuration
  -100
)

tl.play()
```

[timeline codesandbox](https://codesandbox.io/s/timeline-basic-forked-w9cy9c)

## API

### interpol constructor

```ts
interface IInterpolConstruct {
  // Start interpolation value
  // default: `0`
  from?: number | (() => number)

  // End interpolation value
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
  // default: /
  reverseEase?: (t: number) => number

  // Make interpol paused at start (not autoplay)
  // default: `false`
  paused?: boolean

  // Add delay before first start
  // default: `false`
  delay?: number

  // Enable @wbe/debug to get interpol instance logs
  // exe in your console `localStorage.debug = "interpol:*"`
  // default: `false`
  debug?: boolean

  // Called before start
  // default: /
  onStart?: () => void

  // Called on frame update
  // default: /
  onUpdate?: ({ value, time, progress }: IUpdateParams) => void

  // Called when interpol is complete
  // default: /
  onComplete?: ({ value, time, progress }: IUpdateParams) => void
}
```

### Interpol methods

```ts
import { Interpol } from "./Interpol"

const itp = new Interpol({
  paused: true, // disable autoplay
  from: 0,
  to: 100,
})

// Play the interpol
// play(from: number = 0): Promise<any>
itp.play()

// Reverse and play the interpol
// reverse(from: number = 1): Promise<any>
itp.reverse()

// Pause the interpol
// pause(): void
itp.pause()

// Resumes playing without altering direction (forward or reversed).
// resume(): void
itp.resume()

// Stop the interpol, will reset time, delta and progress.
itp.stop()

// Compute 'from' 'to' and 'duration' values if there are functions
// refreshComputedValues(): void
itp.refreshComputedValues()

// Seek to a specific time
// seek(progress: number): void
// progress: number between 0 and 1
itp.seek(0.5)
```

### Timeline constructor

```ts
interface ITimelineConstruct {
  // Execute on frame update
  // default: /
  onUpdate?: ({ time, progress }) => void

  // Execute on complete
  // default: /
  onComplete?: ({ time, progress }) => void

  // Enable @wbe/debug to get interpol instance logs
  // exe in your console `localStorage.debug = "interpol:Timeline"`
  // default: `false`
  debug?: boolean

  // Pass a Ticker instance with custom params
  // default: `new Ticker()`
  ticker: Ticker

  // disable timeline autoplay
  // default: `false`
  paused: boolean
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

// Add new Interpol object param
// or Interpol instance
// add(interpol: Interpol | IInterpolConstruct, offsetPosition: number = 0): Timeline
tl.add(
  {
    from: 10,
    to: 1000,
    onUpdate: ({ value, time, progress }) => {
      // ...
    },
  },
  // offset duration
  // this one will start the current interpol 100ms before the last interpol end.
  -100
)

// start the timeline
// play(from: number = 0): Promise<any>
tl.play()

// reverse and play the timeline
// reverse(from: number = 1): Promise<any>
tl.reverse()

// paused the timeline, will keep time, delta and progress.
// pause(): void
tl.pause()

// resume the timeline after pause.
// resume(): void
tl.resume()

// stop the timeline, will reset time, delta and progress.
// stop(): void
tl.stop()

// seek to a specific time
// seek(progress: number): void
// progress is a number between 0 and 1
tl.seek(0.5)
```

## Dev examples

```shell
# install dependencies
pnpm i

# build and watch lib changes
pnpm run build:watch

# start tests and watch
pnpm run test:watch

# start dev server on selected example
pnpm run dev
```

## Credits

- [gsap](https://greensock.com/gsap/)
- [animate](https://github.com/SolalDR/animate/)
- [animini](https://github.com/dbismut/animini)
- [signal](https://github.com/zouloux/signal)

## License

See the LICENSE file for license rights and limitations (MIT).
