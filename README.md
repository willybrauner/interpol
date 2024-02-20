<h1 align="center" style="text-align:center">Interpol 👮🏽‍</h1>
<p align="center">
<img alt="npm" src="https://img.shields.io/npm/v/@wbe/interpol">
<img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/%40wbe%2Finterpol">
<img alt="build" src="https://github.com/willybrauner/interpol/workflows/tests/badge.svg">
</p>
<p align="center">
<img alt="logo" src="./packages/interpol/interpol.png">
</p>

Interpol library interpolates values between two points.
This is the lowest level of animate machine.
Interpol is *initially* not a DOM API, it provides real time progress of the interpolation that can be use or bind
on... anything, for ~=3kB! 

## Summary

- [Playground](#playground-%EF%B8%8F)
- [Install](#install)
- [Basic usage](#basic-usage)
  - [Interpol](#interpol)
  - [Timeline](#timeline)
- [Interpol DOM styles](#interpol-dom-styles)
  - [Props unit](#props-unit)
  - [Styles helper](#styles-helper)
  - [El property](#el-property)
  - [Real word example](#real-word-example)
- [Easing](#easing)
- [API](#api)
  - [Interpol constructor](#interpol-constructor)
  - [Interpol methods](#interpol-methods)
  - [Timeline constructor](#timeline-constructor)
  - [Timeline methods](#timeline-methods)
- [Options](#options)
  - [Raf](#raf)
  - [Defaults properties](#defaults-properties)
- [Dev examples](#dev-examples)
- [Credits](#credits)
- [About](#about)
- [License](#license)


## Playground 🕹️

The examples of this repo are available on codesandbox:

- [Interpol basic](https://codesandbox.io/s/github/willybrauner/interpol/tree/main/examples/interpol-basic)
- [Interpol ease](https://codesandbox.io/s/github/willybrauner/interpol/tree/main/examples/interpol-ease)
- [Interpol graphic](https://codesandbox.io/s/github/willybrauner/interpol/tree/main/examples/interpol-graphic)
- [Interpol menu](https://codesandbox.io/s/github/willybrauner/interpol/tree/main/examples/interpol-menu)
- [Interpol object el](https://codesandbox.io/s/github/willybrauner/interpol/tree/main/examples/interpol-object-el)
- [Interpol offsets](https://codesandbox.io/s/github/willybrauner/interpol/tree/main/examples/interpol-offsets)
- [Interpol particles](https://codesandbox.io/s/github/willybrauner/interpol/tree/main/examples/interpol-particles)
- [Interpol timeline](https://codesandbox.io/s/github/willybrauner/interpol/tree/main/examples/interpol-timeline)

## Install

```shell
npm i @wbe/interpol
```

## Basic usage

### Interpol

```js
import { Interpol } from "@wbe/interpol"

new Interpol({
  props: {
    v: [0, 100],
  },
  duration: 1000,
  onUpdate: ({ v }, time, progress) => {
    // Do something with `v` value 
  },
})
```

In this example:
- `v` will be interpolated between 0 and 100 during 1 second
- `time` is the current time in millisecond
- `progress` is the current progress between 0 and 1

### Timeline

Chain interpol instancies with Timeline:

```js
import { Interpol, Timeline } from "@wbe/interpol"

const itp1 = new Interpol({
  props: {
    v: [0, 100],
  },
})
const itp2 = new Interpol({
  props: {
    v: [-100, 100],
  }
})

new Timeline()
  .add(itp1)
  .add(itp2)
```

In this example:
- The timeline will start automatically
- `itp1` will interpolate `v` value between 0 and 100 during 1 second
- `itp2` will start when `itp1` is complete and will interpolate `v` value between -100 and 100 during 1 second

## Interpol DOM styles

One of the main usage of Interpol is to animate DOM styles. The API provide some helpers to simplify this usage and avoid to write the same code each time you want to animate a DOM element.

 - [Props unit](#props-unit): define a unit for each props in the props array
 - [Styles helper](#styles-helper): a core helper function to simplify the DOM manipulation
 - [el property](#el-property): set the DOM element to animate directly in the constructor

### Props unit

One props array is able to receive a string an optional third value unit who will be associated to the interpolated value.

Without the unit:

```ts
new Interpol({
  props: {
    top: [-100, 0],
  },
  onUpdate: ({ top }) => {
    // Set manually the unit each time
    element.style.top = `${top}px`
  }
}) 
```

With the unit as 3th value:

```ts
new Interpol({
  props: {
    // [from, to, unit]
    top: [-100, 0, "px"],
  },
  onUpdate: ({ top }) => {
    // top is value + "px" is already defined
    element.style.top = top 
  }
}) 
```


### Styles helper

This repository provides a `styles` helper function that simplifies DOM manipulation.
The function uses a DOM cache to associate multiple transformation functions with the same DOM element at the same time.

Definition:
```ts
declare const styles: (element: HTMLElement | HTMLElement[] | null, props: Record<string, string | number>) => void
```

Example:

```ts
import { Interpol, styles } from "./Interpol"

new Interpol({
  props: {
    x: [-100, 0, "%"],
    opacity: [0, 1],
  },
  onUpdate: ({ x, opacity }) => {
    styles(element, { x, opacity })
    
    // Is Equivalent to:
    // element.style.transform = `translate3d(${x}%, 0px, 0px)`
    // element.style.opacity = opacity
  },
}) 
```

### `el` property

But it might be redundant to set props on item styles every time we want to animate the interpol instance. Therefore, you can use the `el` property constructor to define the DOM element to animate. No more using the `onUpdate` callback.

```ts
new Interpol({
  // can recieve HTMLElement or HTMLElement[]
  el: document.querySelector("div"),
  props: {
    x: [-100, 0, "%"],
    opacity: [0, 1],
  }
})
```

Under the hood, the `el` property is used by the `styles` helper function, inside the `onUpdate` callback, just like in the previous example.

You have to be careful of some points:

- props needs their appropriate unit defined
- props keys must be valid CSS properties, (except `x`, `y`, `z` witch are aliases for `translateX`, `translateY`, `translateZ`) 


## Real word example

```ts
import { Timeline } from "@wbe/interpol"

// The DOM element we want to animate
const element = document.querySelector("div")

// Create a timeline instance
const tl = new Timeline({ 
  paused: true,
  onComplete: () => {
    tl.isReversed() 
      ? console.log("Timeline reverse is complete") 
      : console.log("Timeline is complete")
  },
})

// `add()` can recieve an Interpol object constructor
tl.add({
  el: element,
  props: {
    x: [-100, 0, "%"],
    y: [0, 100, "px"],
  },
  duration: 1000,
  ease: t => t * (2 - t),
  onComplete: () => {
    console.log("This interpol is complete")
  },
});

tl.add({
    props: {
      width: [10, 50],
    },
    duration: 500,
    ease: t => t * t,
    onUpdate: ({ width }) => {
        element.style.width = `${width}%`
    },
  },
  // set an offset duration, 
  // this interpol will start 100ms before the previous interpol end
  "-=100")

await tl.play()
// timeline is complete
await tl.reverse()
// timeline reverse is complete
```



## Easing

`ease` & `reversedEase` functions are used to interpolate the progress value. the default one is `(t) => t`.

```js
new Interpol({
  ease: (t) => 1 - Math.pow(1 - t, 4),
})
```

[GSAP like ease functions](./packages/interpol/src/core/ease.ts) are available in interpol as string or object:

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

```ts
import { EaseFn } from "./ease"

interface IInterpolConstruct<K extends keyof Props> {
  // props are an interpol list object
  // [from, to, unit]
  // default: /
  props: Record<K, [number | (() => number), number | (() => number), string]>

  // Interpolation duration between `from` and `to` values (millisecond).
  // ex: 1000 is 1 second
  // default: `1000`
  duration?: number | (() => number)

  // Interpol easing function
  // default: `t => t` (lineal easing)
  ease?: EaseName | EaseFn

  // Overwrite easing function on reverse
  // default: /
  reverseEase?: EaseName | EaseFn

  // Make interpol paused at start (not autoplay)
  // default: `false`
  paused?: boolean

  // Add delay before first start
  // default: `false`
  delay?: number

  // Enable debug to get interpol logs information
  // default: `false`
  debug?: boolean

  // Called when interpol is ready to play
  // default: /
  beforeStart?: (props?: Record<K, number>, time?: number, progress?: number) => void

  // Called on frame update
  // default: /
  onUpdate?: (props?: Record<K, number>, time?: number, progress?: number) => void

  // Called when interpol is complete
  // default: /
  onComplete?: (props?: Record<K, number>, time?: number, progress?: number) => void

  // Execute onUpdate method when the Interpol instance is created, just before "beforeStart"
  // (equivalent to beforeStart)
  // default: false
  initUpdate?: boolean
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

// Compute ['from', 'to'] and 'duration' values if there are functions
// refreshComputedValues(): void
itp.refreshComputedValues()

// Seek to a specific time
// seek(progress: number): void
// progress: number between 0 and 1
itp.seek(progress)
```

### Timeline constructor

```ts
interface ITimelineConstruct {
  // Execute on frame update
  // default: /
  onUpdate?: (time: number, progress: number) => void

  // Execute on complete
  // default: /
  onComplete?: (time: number, progress: number) => void

  // Enable debug to get timeline instance logs
  // default: `false`
  debug?: boolean
  
  // disable timeline autoplay
  // default: `false`
  paused: boolean
}
```

### Timeline methods

```ts
import { Timeline } from "@wbe/Interpol"

const tl = new Timeline()

// add(interpol: Interpol | IInterpolConstruct, offset: number | string = "0"): Timeline
// @param interpol: Interpol object or Interpol instance
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

// seek to a specific time
// seek(progress: number): void
// progress is a number between 0 and 1
tl.seek(progress)
```

## Options

Global option Object is available to set property for each Interpol & Timeline instance.

### Raf 

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

### Defaults properties

```ts
import { InterpolOptions } from "@wbe/interpol"
// Set default duration for all interpol instances
InterpolOptions.durarion = 1000
// Set default easing for all interpol instances
InterpolOptions.ease = (t) => t * t

```


## Dev examples

```shell
# install dependencies
pnpm i

# build and watch lib changes
pnpm run build:watch

# start tests and watch
pnpm run test:watch

# start dev server for all examples
pnpm run dev

# Or run a specific example
pnpm run dev --scope interpol-basic
pnpm run dev --scope {example-name}
```

## Credits

- [gsap](https://greensock.com/gsap/)
- [animate](https://github.com/SolalDR/animate/)
- [animini](https://github.com/dbismut/animini)
- [signal](https://github.com/zouloux/signal)


## About 

Interpol is an open-source project created and maintained by [Willy Brauner](https://willybrauner.com).

## License

See the LICENSE file for license rights and limitations (MIT).
