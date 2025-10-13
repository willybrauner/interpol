<h1 align="center" style="text-align:center">Interpol</h1>
<p align="center">
<img alt="npm" src="https://img.shields.io/npm/v/@wbe/interpol">
<img alt="npm-downloads-src" src="https://img.shields.io/npm/dt/@wbe/interpol">
<img alt="build" src="https://github.com/willybrauner/interpol/workflows/tests/badge.svg">
</p>
<p align="center">
<img alt="logo" src="https://github.com/willybrauner/interpol/blob/main/interpol.webp" />
</p>

Interpol library **interpolates a set of number values with a GSAP-like API**.
This is the lowest level of animate machine.
Interpol don't come with dom API, it only provides real time progress of the interpolations that can be use or bind
on... mesh, dom element or anything else, for ~=3kB!

> [!IMPORTANT]
> Interpol still is in development, the API can change until the first major release.

> [!NOTE]
> For an in-depth discovery of the library, check out this [Interpol blog post](https://willybrauner.com/journal/interpol).

## Summary

- [Summary](#summary)
- [Install](#install)
- [Basic usage](#basic-usage)
  - [Interpol](#interpol)
  - [Timeline](#timeline)
  - [Timeline add callback \& offsets](#timeline-add-callback--offsets)
- [Props](#props)
  - [Props types](#props-types)
  - [Computed prop values](#computed-prop-values)
- [Styles helper](#styles-helper)
- [Easing](#easing)
- [API](#api)
  - [interpol constructor](#interpol-constructor)
  - [Interpol methods](#interpol-methods)
  - [Timeline constructor](#timeline-constructor)
  - [Timeline methods](#timeline-methods)
- [Options](#options)
  - [Ticker](#ticker)
    - [Disable internal raf](#disable-internal-raf)
    - [Use the internal Ticker instance globally](#use-the-internal-ticker-instance-globally)
  - [Defaults properties](#defaults-properties)
- [Dev](#dev)
- [Playground](#playground)
- [Showcase](#showcase)
- [Credits](#credits)
- [About](#about)
- [License](#license)

## Install

```shell
npm i @wbe/interpol
```

## Basic usage

### Interpol

`Interpol` instance usage:

```js
import { Interpol } from "@wbe/interpol"

new Interpol({
  v: [0, 100],
  z: [-100, 200],
  duration: 1000,
  ease: (t) => t * t,
  onUpdate: ({ v, z }, time, progress) => {
    // Use updated `v` and `z` values on each frame
  },
  onComplete: ({ v, z }, time, progress) => {
    // Interpol is complete
  },
})
```

In this example:

- The Interpol will start automatically
- `v` will be interpolated between `0` and `100` during 1000 milliseconds
- `z` will be interpolated between `-100` and `200` during 1000 milliseconds
- `time` is the current time in millisecond
- `progress` is the current percent progress between `0` and `1`

### Timeline

Chaining interpol instancies with `Timeline`:

```js
import { Interpol, Timeline } from "@wbe/interpol"

const tl = new Timeline()

tl.add({
  x: [0, 100],
  duration: 750,
  onUpdate: ({ x }, time, progress) => {},
})
tl.add({
  foo: [100, 50],
  bar: [0, 500],
  duration: 500,
  onUpdate: ({ foo, bar }, time, progress) => {},
})
```

In this example:

- The timeline will start automatically
- Interpol 1, will interpolate `x` value between `0` and `100` during 750 ms
- Interpol 2, will start when Interpol 1 is complete and will interpolate `foo` & `bar` values during 500 ms

### Timeline add callback & offsets

A timeline can also be used to add callback function instead of Interpol instance or constructor.

```ts
tl.add(() => {
  // do something when the timeline reaches this point
})
```

Plus, you can set an offset to the callback to execute it at a specific time in the timeline.
Two types of offsets are available:

- **Relative offset**: a string with a number and an operator, relative to the previous: `"+=100"` `"-=100"`
- **Absolute offset**: a number in milliseconds, relative to the timeline start: `100`, `-100`, `0`

A full example:

```ts
import { Timeline } from "@wbe/interpol"

const tl = new Timeline()

tl.add({
  x: [-20, 100],
  onUpdate: ({ x }, time, progress) => { ... },
})

// Set a callback as parameter instead of an Interpol instance or constructor
tl.add(() => {
  console.log("Timeline reached this point when previous add is complete")
})

// Set a callback with an absolute offset (50ms in this case)
tl.add(() => {
  console.log("Timeline reached this point exactly 50ms after the beginning")
}, 50)

// Set a callback with a relative offset (-50 in this case)
tl.add(() => {
  console.log("Timeline reached this point 50ms before the previous interpol end")
}, '-=50')
```

## Props

### Props types

For more flexibility, there is three ways to define a single `prop`:

```ts
new Interpol({
  // 1. a simple number, implicite from is `0`
  // to use only when `from` is `0`
  x: 100,

  // 2. an array
  // [from, to]
  x: [0, 100],

  // 3. an object with explicite `from` and `to` properties
  // { from?, to, ease?, reverseEase? }
  x: { from: 0, to: 100 },
})
```

### Computed prop values

`from` and `to` can be a number or a function that return a number.
Three ways to define a `to` computed value on the same `prop` model:

```ts
new Interpol({
  // 1. number
  x: () => Math.random(),

  // 2. array
  x: [0, () => Math.random()],

  // 3. object
  x: { from: 0, to: () => Math.random() },
})
```

In order to refresh computed values, you can use the `refresh` method:

```ts
const itp = new Interpol({
  // ...
})
itp.refresh()
```

## Styles helper

One of the main usage of Interpol is to animate DOM element style properties.
The API provide `styles`, a core helper function to simplify the DOM manipulation.
The function uses a DOM cache to associate multiple transformation functions with the same DOM element at the same time.

Definition:

```ts
declare const styles: (
  element: HTMLElement | HTMLElement[] | Record<any, number> | null,
  props: Record<string, string | number>,
  autoUnits: boolean = true,
) => void
```

Example:

```ts
import { Interpol, styles } from "@wbe/Interpol"

new Interpol({
  x: [-100, 0],
  y: [0, 50],
  opacity: [0, 1],
  onUpdate: ({ x, y, opacity }) => {
    // set updated interpol values to the DOM element
    styles(element, { x, y, opacity })
    // Is Equivalent to:
    // element.style.transform = `translate3d(${x}px, ${y}px, 0px)`
    // element.style.opacity = opacity
  },
})
```

## Easing

`ease` & `reversedEase` functions are used to interpolate the progress value. the default one is `(t) => t`.

```js
new Interpol({
  ease: (t) => 1 - Math.pow(1 - t, 4),
})
```

[GSAP like ease functions](src/core/ease.ts) are available in Interpol as string or object:

```js
import { Interpol, Power3 } from "@wbe/interpol"

// as typed string
new Interpol({
  ease: "power3.out",
})

// or, import the object
new Interpol({
  ease: Power3.out,
})
```

## API

### interpol constructor

For mor details, see the full type definition [types.ts](src/core/types.ts)

```ts
// A Value can be a number or a computed number
type Value = number | (() => number)

// The propsValues type can be a single number, an array or an object
export type PropsValues =
  // 1. to
  | Value
  // 2. [from, to]
  | [Value, Value]
  // 3. { from, to, ease, reverseEase }
  | Partial<{ from: Value; to: Value; ease: Ease; reverseEase: Ease }>

/**
 * Interpol constructor
 */
interface IInterpolConstruct<K extends keyof Props> {
  // inline props are an interpol list object, 3 definition types
  // default: /
  [x: string]: PropsValues

  // Interpolation duration between `from` and `to` values (millisecond).
  // ex: 1000 is 1 second
  // default: `1000`
  duration?: number | (() => number)

  // Interpol easing function
  // default: `t => t` (lineal easing)
  ease?: (EaseName | EaseFn) | (() => EaseName | EaseFn)

  // Overwrite easing function on reverse
  // default: `ease`
  reverseEase?: (EaseName | EaseFn) | (() => EaseName | EaseFn)

  // Make interpol paused at start (not autoplay)
  // default: `false`
  paused?: boolean

  // Add delay before first start
  // default: `false`
  delay?: number | (() => number)

  // Enable debug to get interpol logs information
  // default: `false`
  debug?: boolean

  // Called when interpol is ready to play
  // default: /
  beforeStart?: (
    props: Record<K, number>,
    time: number,
    progress: number,
    instance: Interpol,
  ) => void

  // Called one frame before the interpol start with default params values
  // default: /
  onStart?: (props: Record<K, number>, time: number, progress: number, instance: Interpol) => void

  // Called on frame update
  // default: /
  onUpdate?: (props: Record<K, number>, time: number, progress: number, instance: Interpol) => void

  // Called when interpol is complete
  // default: /
  onComplete?: (
    props: Record<K, number>,
    time: number,
    progress: number,
    instance: Interpol,
  ) => void

  // Execute onUpdate method when the Interpol instance is create
  // default: false
  immediateRender?: boolean
}
```

### Interpol methods

```ts
import { Interpol } from "@wbe/Interpol"

const itp = new Interpol()

// Play the interpol
// play(from: number = 0): Promise<any>
itp.play(from)

// Reverse and play the interpol
// reverse(from: number = 1): Promise<any>
itp.reverse(from)

// Pause the interpol
// pause(): void
itp.pause()

// Resumes playing without altering direction (forward or reversed).
// resume(): void
itp.resume()

// Stop the interpol, will reset time, delta and progress.
// stop(): void
itp.stop()

// Compute 'from', 'to' 'duration', 'ease' & 'delay' values if there are functions
// refresh(): void
itp.refresh()

// Set progress to a specific value
// progress(value: number, suppressEvents = true): void
// value: number between 0 and 1
itp.progress(progressValue)

// Get current progress value
// progress(): number
itp.progress()
```

### Timeline constructor

```ts
interface ITimelineConstruct {
  // Executed on frame update
  // default: /
  onUpdate?: (time: number, progress: number) => void

  // Executed on complete
  // default: /
  onComplete?: (time: number, progress: number) => void

  // Enable debug to get timeline instance logs
  // default: `false`
  debug?: boolean

  // Disable timeline autoplay
  // default: `false`
  paused: boolean
}
```

### Timeline methods

```ts
import { Timeline } from "@wbe/Interpol"

const tl = new Timeline()

// add(interpol: Interpol | IInterpolConstruct, offset: number | string = "0"): Timeline
// @param interpol: Interpol object | Interpol instance | () => void
// @param offset:
//  - relative to the previous interpol (string): "+=100", "-=100", "100", "-100"
//  - absolute (number): 0 (from the tl beginning), 100
tl.add(Interpol, offset)

// start the timeline
// play(from: number = 0): Promise<any>
tl.play(from)

// reverse and play the timeline
// reverse(from: number = 1): Promise<any>
tl.reverse(from)

// paused the timeline, will keep time, delta and progress.
// pause(): void
tl.pause()

// resume the timeline after pause.
// resume(): void
tl.resume()

// stop the timeline, will reset time, delta and progress.
// stop(): void
tl.stop()

// call refresh on each interpol instance
tl.refresh()

// set progress to a specific value
// value is a number between 0 and 1
// progress(value: number, suppressEvents = true, suppressTlEvents = true): void
tl.progress(progressValue)

// Get current progress value
// progress(): number
tl.progress()
```

## Options

Global option Object is available to set property for each Interpol & Timeline instance.

### Ticker

#### Disable internal raf

It's possible to disable the internal raf and use your own raf callback if needed.

```ts
import { InterpolOptions } from "@wbe/interpol"

// disable internal raf to use your own raf
InterpolOptions.ticker.disable()
const tick = (e) => {
  // execute Ticker.raf() callback on your own raf
  InterpolOptions.ticker.raf(e)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
```

#### Use the internal Ticker instance globally

The internal Ticker instance is available for a global application use. You can add your own raf callback to the Ticker instance and choose the rank of the callback handler.

```ts
import { InterpolOptions } from "@wbe/interpol"

// Set a new raf callback to the Ticker instance
const tickHandler = (t) => console.log(t)
const rank = 1
InterpolOptions.ticker.add(tickHandler, rank)
// ...
InterpolOptions.ticker.remove(tick)
```

### Defaults properties

```ts
import { InterpolOptions } from "@wbe/interpol"
// Set default duration factor for all interpol instances, 1 is millisecond / 1000 is second
InterpolOptions.durationFactor = 1
// Set default duration for all interpol instances
InterpolOptions.duration = 1000
// Set default easing for all interpol instances
InterpolOptions.ease = (t) => t * t
```

## Dev

```shell
# install dependencies
pnpm i

# build and watch lib changes
pnpm run build:watch

# start tests and watch
pnpm run test:watch
```

## Playground

All examples can be found in the [examples](./examples) folder. You can easily start all the examples with the command:

```shell
# start dev server for all examples
pnpm run dev --open
```

## Showcase

These projects have been built with Interpol. PRs are open to add your project to this list.

- [oggy-story.com](https://oggy-story.com)
- [julienjussey.com](https://julienjussey.com)
- [theoplawinski.com](https://www.theoplawinski.com)
- [willybrauner.com](https://willybrauner.com)

## Credits

- [gsap](https://greensock.com/gsap/)
- [animate](https://github.com/SolalDR/animate/)
- [animini](https://github.com/dbismut/animini)
- [signal](https://github.com/zouloux/signal)

## About

Interpol is an open-source project created and maintained by [Willy Brauner](https://willybrauner.com).

## License

See the LICENSE file for license rights and limitations (MIT).
