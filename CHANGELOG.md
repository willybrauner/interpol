# @wbe/interpol

## 0.30.0

### Minor Changes

- 56bf407: Improve performances

  ## Breaking changes
  - Remove `beforeStart` method witch can be replaced by simple code before the instance.
  - Remove deprecated `refreshComputedValues` in `Timeline` and `Interpol`

  ## Improvements

  ### Code Organization & Structure
  - Remove duplicated logic in Timeline play
  - Internalize events inside the `Ticker` class
  - Inline all closures from `onEachProps` & `onAllAdds`

  ### Optimization
  - Optimize `styles` function using `for` loop instead of regex
  - Use a `for` loop in the `raf` method
  - Cache `Object.keys` / `Object.values` results in `refresh` to reduce allocations
  - Rewrite `chooseEase` and create `EASE_MAP` outside `easeAdapter` to avoid recreation on each call
  - Remove `async` from `handleTick` methods
  - Replace `setTimeout` with `queueMicrotask` in `Ticker` and `Timeline.add`

  ### Debug
  - Guard debug log: only build the log object when debug is enabled
  - Prevent unnecessary promise creation when `Interpol` is instantiated from `Timeline`

## 0.29.0

### Minor Changes

- 3d5589c: Access to some global properties via `engine` object:

  before:

  ```ts
  import { InterpolOptions } from "@wbe/interpol"

  InterpolOptions.ticker.add(() => {})
  ```

  after:

  ```ts
  import { engine } from "@wbe/interpol"

  engine.ticker.add(() => {})
  ```

## 0.28.0

### Minor Changes

- ded0ac0: Array prop value accepts keyframes 🎉

  before:

  ```ts
  const itp = new Interpol({
    // Array prop value was limited to [from, to]
    x: [0, -100],
    duration: 1000,
    onUpdate: ({ scale, x }) => {
      // ...
    },
  })
  ```

  after:

  ```ts
  const itp = new Interpol({
    // Array prop value can now accept multiples keyframes
    x: [0, -100, 100, -50, 50, -25, 25, 0],
    duration: 1000,
    onUpdate: ({ scale, x }) => {
      // ...
    },
  })
  ```

  In this example, the `x` prop will animate through the values in the array, **across the duration of the animation**. The progress will be divided into equal segments based on the number of keyframes, and the value will interpolate between each segment accordingly.

  This allows to create more complex animations with multiple segments without having to create multiple Interpol.

## 0.27.1

### Patch Changes

- de50ee8: Repo management
  - Separate utils & core
  - Move all the `packages/interpol/src` in root `src`
  - Remove turbo. Use pnpm --parallel instead for start examples
  - Add licence file

## 0.27.0

### Minor Changes

- 6d33c38: Rename `refreshComputedValues()` to `refresh()`

  `refreshComputedValues()` is deprecated. Use `refresh()` instead.

  before:

  ```ts
  const itp = new Interpol({ ... })
  itp.refreshComputedValues()

  const tl = new Timeline({ ... })
  tl.refreshComputedValues()
  ```

  after:

  ```ts
  const itp = new Interpol({ ... })
  itp.refresh()

  const tl = new Timeline({ ... })
  tl.refresh()
  ```

## 0.26.0

### Minor Changes

- 8c8bf3b: Use `ease` and `reverseEase` as computed values

  ```ts
  new Interpol({
    ease: () => randomEase(),
    reverseEase: () => randomEase(),
  })
  ```

## 0.25.1

### Patch Changes

- 1ca34db: Timeline play return promise

  before:

  ```ts
  const timeline = new Timeline({
    onComplete: () => {
      // was properly called ✅
    },
  })

  timeline.play().then(() => {
    // was never called 🚫
  })
  ```

  after:

  ```ts
  const timeline = new Timeline({
    onComplete: () => {
      // was properly called ✅
    },
  })

  timeline.play().then(() => {
    // is properly called now  ✅
  })
  ```

## 0.25.0

### Minor Changes

- e2a023c: Transform delay as a computed property

  `delay`property can now be used as a computed property, like props values & duration.

  ```ts
  const itp = new Interpol({
    delay: () => Math.random() * 1000,
  })

  itp.refreshComputedValues()
  ```

## 0.24.0

### Minor Changes

- 1f26cbd: meta fields

  `Interpol` constructor now accepts a `Record<string, any>` `meta` field object to access custom Interpol properties from the instance.

  ```ts
  const itp = new Interpol({
    meta: {
      type: "first",
    },
    x: [0, 100],
    onUpdate: ({ x }) => {
      // ...
    },
  })

  console.log(itp.meta) // { type: "first" }
  ```

## 0.23.1

### Patch Changes

- eba4b2c: Fix a bug when we mix absolute and relative Timeline add offsets:

  before:

  ```ts
  const tl = new Timeline()

  tl.add({}, 1000)
  tl.add({}, "-=100") // was not started to 900 but -100 🚫
  ```

  after:

  ```ts
  const tl = new Timeline()

  tl.add({}, 1000)
  tl.add({}, "-=100") // is started to 900ms ✅
  ```

## 0.23.0

### Minor Changes

- 8d03bb7: tl.add method accept callback function

  ```ts
  const tl = new Timeline()

  // default Interpol constructor
  tl.add({
    v: [0, 100],
    onUpdate: ({ x }, time, progress) => { ... },
  })

  // ✅ new! set a callback function (as GSAP `call()` does)
  tl.add(() => {
    // ...
  })

  // with relative offset
  tl.add(() => {
   // ...
  }, "-=100")

  // with absolute offset
  tl.add(() => {
   // ...
  }, 0)
  ```

## 0.22.0

### Minor Changes

- da163ac: Rename seek method to progress

  **Breaking change**

  In order to fit to the [GSAP API](<https://gsap.com/docs/v3/GSAP/Tween/progress()>), Interpol & Timeline `seek` method has been renamed `progress`.
  `progress` is now a getter and setter:

  ```ts
  // Set progress to a specific value
  itp.progress(progressValue): void

  // Get current progress value
  itp.progress(): number
  ```

## 0.21.0

### Minor Changes

- 679881a: Interpol onStart method

  exec Interpol `onStart` on `play()` only if we start from `0`
  exec Interpol `onStart` on `seek()` each time we start from 0 and go to...

## 0.20.3

### Patch Changes

- d76a060: Export easing types

## 0.20.2

### Patch Changes

- 7ac5c12: fix: Interpol & Timeline reverse Promise

  `play` and `reverse` before the end of the `play`. The reverse promise was non-existent.
  The expected behavior is to get a a reverse promise who resolve when the `reserve()` is complete.

  before:

  ```ts
  const duration = 1000
  const itp = new Interpol({ duration })

  itp.play()
  await new Promise((r) => setTimeout(r, duration / 2))
  await itp.reverse()
  console.log("reverse complete") // bug: was called before the reverse end
  ```

  after:

  ```ts
  const duration = 1000
  const itp = new Interpol({ duration })

  itp.play()
  await new Promise((r) => setTimeout(r, duration / 2))
  await itp.reverse()
  console.log("reverse complete") // is called when reverse is complete
  ```

## 0.20.1

### Patch Changes

- 8470e1a: Add missing description & author in package.json

## 0.20.0

### Minor Changes

- c80c9cf: ## Back to basic Interpol instance functionalities

  The library has started to shift in size and maintenance away from its original purpose. Everything related to DOM processing will be removed from the Interpol instance. The use of Interpol for DOM manipulation is still available and the purpose of the library is still there, but it needs to be managed manually. Interpol needs to be kept as low-level as possible to allow anyone to implement a wrapper based on their needs.

  These breaking changes will make the API more predictable and focus on what this library is for, which is interpolating sets of values.

  ## Breaking changes
  - [ Breaking changes ] Remove `props` object constructor params, keep only `...props`. In order to simplify the usage of props, a unique way to declare props is now "inline props" on the root constructor.

  before:

  ```ts
  new Interpol({
    props: {
      x: [0, 1],
    },
  })
  ```

  after:

  ```ts
  new Interpol({
    x: [0, 1],
  })
  ```

  - [ Breaking change ] Remove `unit` from props. Callback returns only `number` prop, units will be added by `styles` for basic. Props units are linked to a DOM manipulation. As others dom subjects, it have been remove from the API.

  before:

  ```ts
  new Interpol({
    props: {
      x: [0, 1, "px"],
      y: { from: 0, to: 10, unit: "px" },
    },
  })
  ```

  after:

  ```ts
  new Interpol({
   x: [0, 1],
   y: [0, 1]
   onUpdate: ({.x,y })=> {
     // props returned are always `number`
     // merge manually your unit to the value if needed
   }
  })
  ```

  - [ Breaking change ] `el` property has been removed from the constructor.

  before:

  ```ts
  // el style was automatically set
  new Interpol({
    el: document.querySelector("div"),
    props: {
      x: [0, 1, "px"],
    },
  })
  ```

  after:

  ```ts
  new Interpol({
    x: [0, 1],
    onUpdate: ({ x }) => {
      // always set manually the interpolate value on the DOM
      // No magic, more predictible
      document.querySelector("div").style.transform = `translateX(${x}px)`
    },
  })
  ```

  ## Features
  - [ Feature ] Improve `styles` function with `autoUnits`
    A 3th `autoUnits` param as been added to `styles()` function.

  ```ts
  declare const styles: (
    element: HTMLElement | HTMLElement[] | Record<any, number> | null,
    props: Record<string, string | number>,
    autoUnits: boolean = true,
  ) => void
  ```

  ```ts
  new Interpol({
    x: [0, 1],
    onUpdate: ({ x }) => {
      // x is a number, and translateX need to be a 'px'.
      // style will automatically set 'px' on selected properties if a number is set as param.
      styles(element, { x })
      // `translate3d(${x}px, 0px, 0px)`

      // we can disable autoUnits if needed
      styles(element, { x }, false)
      // `translate3d(${x}, 0px, 0px)`
    },
  })
  ```

  - [x] fix props key types
  - [x] update Interpol / Timeline tests
  - [x] update examples
  - [x] update de documentation

## 0.19.0

### Minor Changes

- 042be0d: in addition to having an effect on the duration of the interpolation, `InterpolOptions.durationFactor` impact now `delay` & `offset` too.

  First, set new values on global options:

  ```ts
  InterpolOptions.durationFactor = 1000
  InterpolOptions.duration = 1 // default duration
  ```

  `InterpolOptions.durationFactor` as effect on interpol `delay` property:

  ```ts
  new Interpol({
    // will wait 100ms before start
    delay: 0.1,
  })
  ```

  `InterpolOptions.durationFactor` as effect on Timeline `add()` `offset` params:

  ```ts
  const tl = new Timeline({
    onComplete: (time) => {
      console.log(time) // 300
    },
  })

  tl.add({ duration: 0.2 })
  // start .1 after the first add
  // .1 is the offset of 100ms if global durationFactor is set to 1000
  tl.add({ duration: 0.2 }, 0.1)
  ```

## 0.18.0

### Minor Changes

- 292d244: Set a new the global `durationFactor` for each Interpol instances.
  It makes the Interpol usage more closer to gsap, if needed:

  ```ts
  import { Interpol, InterpolOptions } from "@wbe/interpol"

  // set a new global durationFactor
  InterpolOptions.durationFactor = 1000 // second
  new Interpol({
    duration: 1, // 1 = one second
    onComplete: (_, time) => {
      console.log(time) // 1000
    },
  })
  ```

## 0.17.0

### Minor Changes

- 17b0d4f: Interpol constructor accept inline props! Object props still working for Backward Compatibility.

  ```ts
  new Interpol({
        // Old object props remains available
        props: {
          x: 100,
          y: -100,
          // (will be overrided by inline props)
          top: -2000,
        },
        // NEW! inline props works outside the props object
        top: [0, 100],
        left: [-100, 100, "px"],

        onComplete: ({ x, y, top, left }) => {
        })
  })
  ```

## 0.16.0

### Minor Changes

- dc0f568: Use the initial Interpol ticker instance for all raf callback of the application.

  A new second param `rank: number` is added to `add()` method. It allows to choose in each order, the callback handker need to be executed. In this exemple, this one is second position, because Interpol ranking is 0

  ```ts
  import { InterpolOptions } from "@wbe/interpol"

  const tickHandler = (t) => console.log(t)
  const rank = 1
  InterpolOptions.ticker.add(tickHandler, rank)
  // ...
  InterpolOptions.ticker.remove(tick)
  ```

  Using a new ticker instance for all the application:

  ```ts
  import { Ticker, InterpolOptions } from "@wbe/interpol"

  // disable the default Interpol ticker
  InterpolOptions.disable()

  // create a new ticker instance
  const ticker = new Ticker()

  // Add manually the raf method to the callback list of the new ticker
  const interpolTick = (t) => {
    InterpolOptions.ticker.raf(e)
  }
  ticker.add(interpolTick, 0)

  // Add a new callback to this same ticker instance on rank '1'
  const scrollerTick = (t) => {
    // ....
  }
  ticker.add(scrollerTick, 1)
  ```

## 0.15.1

### Patch Changes

- 481f5e6: add exports types
  - To export the correct `cjs` and `esm` builds, add the exports field in `package.json`.
  - bump all dependencies to their last version

## 0.15.0

### Minor Changes

- 288c914: Fix: seek multiple times on the same progress

  Goal is to test if the onUpdate callback is called when we seek to the same progress value multiple times in a row.

  ## Use case example :

  Practical example is when we have to playIn a wall and seek it without transition duration to a specific value when the browser is resized. This situation can now be resolve with this dummy code:

  ```ts
  const itp = new Interpol({
    immediateRender: true,
    paused: true,
    el: wall,
    props: {
      x: {
        from: () => -innerWidth * 0.9,
        to: 0,
        unit: "px",
      },
    },
  })

  let isVisible = false
  button?.addEventListener("click", () => {
    isVisible = !isVisible
    isVisible ? itp.play() : itp.reverse()
  })

  window.addEventListener("resize", () => {
    // the position depends on innerWidth, so we have to re computed this prop value
    itp.refreshComputedValues()
    // seek to progress `0`
    itp.seek(0)
    isVisible = false
  })
  ```

  <video src="https://github.com/willybrauner/interpol/assets/7604357/9535a489-7b01-4a9f-8e02-2edc45927aa4"></video>

  ## timeline refreshComputedValues

  Add `refreshComputedValues()` method on `Timeline` instance. It will refresh computed values of each adds.

  ```ts
  const tl = new Timeline()
  tl.refreshComputedValues()
  ```

## 0.14.0

### Minor Changes

- c275500: Refresh computed values before timeline add() starts.

  Goal of this PR is to update an external variable on the first add() onUpdate and reused it as "from" of the second add(). It will work if "from" of the second add() is a computed value. Behind the scene, we re-execute refreshComputedValues() juste before the add() starts.

  ```ts
  let EXTERNAL_X = 0

  tl.add({
    ease: "power3.in",
    props: {
      x: [0, 100],
    },
    onUpdate: ({ x }) => {
      // Mute the external value
      EXTERNAL_X = x
    },
  })
  tl.add({
    props: {
      // Use the updated external value as computed value
      x: [() => EXTERNAL_X, 50],
    },
    onUpdate: ({ x }) => {
      // x will be interpolated from 100 to 50
    },
  })
  ```

  In order to test this new functionality, the full Interpol Instance is now exposed from each Interpol Callbacks. It allows you to access additional properties like props computeds etc.

  ```ts
  tl.add({
    props: {
      x: [0, 100],
    },
    onUpdate: ({ x }, time, progress, instance) => {
      // instance is available
    },
  })
  ```

## 0.13.0

### Minor Changes

- 5ef8f94: Rename `initUpdate` by `immediateRender` to be as close as possible to the gsap API.
  In this example, `paused` is set to `true`, then, the interpol will not be played automatically. But, if we want to init the style of `element.style` to the `from` value even if the interpol is not running, we have to set `immediateRender: true`:

  ```ts
  new Interpol({
    paused: true,
    immediateRender: true,
    props: {
      x: [0, 1],
    },
    onUpdate: ({ x }) => {
      element.style = x + "px"
    },
  })
  ```

## 0.12.1

### Patch Changes

- 89dcd3d: Remove ease string with capitalize first letter

  Remove this ease string:

  ```ts
  ;"Power1" | "Power2" | "Power3" | "Power4" | "Expo" | "Linear"
  ```

  Prefer using these one:

  ```ts
  ;"power1" | "power2" | "power3" | "power4" | "expo" | "linear"
  ```

## 0.12.0

### Minor Changes

- 59beb18: Prop should accept multi types
  - Prop accept single 'to' `number` instead of [from, to] `array`.

  ```ts
  new Interpol({
    props: {
      x: 1000, // is equivalent to [0, 1000]
    },
  })
  ```

  - Props accept object instead of [from, to] `array`.

  ```ts
  new Interpol({
    props: {
      x: {
        from: 0,
        to: 1000,
        unit: "px",
      }, // is equivalent to [0, 1000, "px"]
    },
  })
  ```

  - Props object accept `ease` & `reverseEase` for a specific prop.

  ```ts
  new Interpol({
    props: {
      x: {
        from: 0,
        to: 1000,
        unit: "px",
        ease: "expo.out",
        reverseEase: "power2.inOut",
      },
    },
  })
  ```

## 0.11.0

### Minor Changes

- d3a3832: Fix seek method and rework event callbacks on Interpol & Timeline

  This PR reveal allows Timeline `onComplete()`exec when using `tl.seek()` method. A major bug has been discovered about the seek method who wasn't working as expected, and is fixed in this PR too.

  ## event callbacks

  before:

  ```ts
  const tl: Timeline = new Timeline({
    paused: true,
    // wasn't called with seek method
    onComplete: () => console.log(`tl onComplete!`),
  })

  tl.seek(1)
  ```

  after:

  ```ts
  const tl: Timeline = new Timeline({
    paused: true,
    // Is executed on seek(1) is suppressTlEvents is false
    onComplete: () => console.log(`tl onComplete!`),
  })

  tl.seek(0, true, false)
  tl.seek(1, true, false)
  ```

  ## Timeline suppressEvents & suppressTlEvents

  `Timeline.seek()` method takes two new arguments: `suppressEvents` & `suppressTlEvents`

  ```ts
    public seek(progress: number, suppressEvents = true, suppressTlEvents = true): void
  ```

  - only execute the timeline event callbacks:

  ```ts
  tl.seek(0.5, true, false)
  ```

  - only execute "Timeline adds" `onComplete` callbacks :

  ```ts
  tl.seek(0.5, false, true)
  ```

  `suppressEvents` params as been copied from gsap API. On the other hand, `suppressTlEvents` doesn't exist in GSAP.

  Example of **Timeline**: with `suppressEvents = false` and `suppressTlEvents = false` we have the same behavior on play/reverse and on seek:
  https://github.com/willybrauner/interpol/assets/7604357/414cb316-cf69-4d24-bcba-5ec267427efa

  ## Interpol suppressEvents

  In the same way, Interpol `suppressEvents` is available (default: true)

  ```ts
    public seek(progress: number, suppressEvents = true): void
  ```

  Example of **Interpol**: with `suppressEvents = false` we have the same behavior on play/reverse on seek:
  https://github.com/willybrauner/interpol/assets/7604357/96601416-2679-46ea-b918-dfd4559bc7c7

  ## Callback executions logic
  - in Interpol and In Timeline, `onComplete` is called only on play and seek(1)
  - `onReverseComplete` should be create for the reverse purpose

  ## TODO in other PRs
  - create `onReverseComplete`
  - exec beforeStart() too

## 0.10.3

### Patch Changes

- d7335ed: Improve props type

  ```ts
  new Interpol({
    props: { x: [0, 100] },
    onUpdate: ({ x }) => {
      // in this case "x" is a number, because no unit is set.
    },
  })

  new Interpol({
    props: { x: [0, 100, "px"] },
    onUpdate: ({ x }) => {
      // in this case "x" is a string, because unit is set.
    },
  })
  ```

  The problem solved, is to make more permissive the prop type in order to set more easily as `number` or `string`.

  Before:

  ```ts
  new Interpol({
    props: { x: [0, 100] },
    onUpdate: ({ x }) => {
      const a: number = x // TS error because number | string is not compatible to number
    },
  })
  ```

  After:

  ```ts
  new Interpol({
    props: { x: [0, 100] },
    onUpdate: ({ x }) => {
      const a: number = x // No error
    },
  })
  ```

## 0.10.2

### Patch Changes

- 4df356c: add npm check updates (ncu) script

## 0.10.1

### Patch Changes

- e6932f8: Fix unstable tests

## 0.10.0

### Minor Changes

- a547e0b: Uniformize & externalize raf
  - Move `Ticker` instance global for each `Interpol` & `Timeline` instances
  - Remove `Ticker` from `Interpol` & `Timeline` constructors
  - Use the same internal raf for each instances
  - Create `InterpolOptions` to access & set global properties

  ```ts
  import { InterpolOptions } from "@wbe/interpol"

  // disable internal raf in order to use your own raf
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

  // Set default duration for all Interpol instances
  InterpolOptions.duration = 1000
  // Set default easing for all Interpol instances
  InterpolOptions.ease = (t) => t * t
  ```

## 0.9.0

### Minor Changes

- 66c3998: el property accepts object

  `el` property can received an object element instead of an HTMLElement:

  ```ts
  const program = {
    uniforms: {
      uProgress: {
        value: 0,
      },
    },
  }

  // classic interpolation
  new Interpol({
    props: {
      value: [0, 100],
    },
    onUpdate: ({ value }) => {
      program.uniforms.uProgress.value = value
    },
  })

  // shortest interpolation with `el` object property
  new Interpol({
    el: program.uniforms.uProgress,
    props: {
      value: [0, 100],
    },
  })
  ```

## 0.8.1

### Patch Changes

- 002f528: Replace @wbe/debug by console.log

## 0.8.0

### Minor Changes

- dd1b869: TL accepts relative and absolute offset

  `offset` of `add({}, offset)` should be relative or absolute

  Relative offset (until this PR, offset was a number offset syntaxe)
  The new relative offset should be a string, according to the GSAP API.

  ```ts
  tl.add({}, "+=50")
  tl.add({}, "+50") // same than "+=50"
  tl.add({}, "50") // same than "+=50"

  tl.add({}, "-=50")
  tl.add({}, "-50") // same than "-=50"
  ```

  Absolute offset is a number. This is the absolute position of the `add()` in the timeline.

  ```ts
  tl.add({}, 100)
  tl.add({}, 0) // start at the debut of the timeline
  tl.add({}, -100) // add duration - 100
  ```

  - [x] adapt examples using relative offset with `number`
  - [x] create new example with input to set offset manually
  - [x] update readme
  - [x] ~~<{offset} | >{offset}~~
  - [x] unit tests

## 0.7.1

### Patch Changes

- 4a7b054: fix tlDuration if offset is less than previous add duration

## 0.7.0

### Minor Changes

- d5079f2: Create a low level DOM API.
  - define a unit for each props in the props array

  ```ts
  new Interpol({
    props: {
      // [from, to, unit]
      top: [-100, 0, "px"],
    },
    onUpdate: ({ top }) => {
      element.style.top = top
    },
  })
  ```

  - Add `styles`, a core helper function to simplify the DOM style manipulation

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

  - Add `el` property to set the DOM element to animate directly in the Interpol constructor.

  ```ts
  new Interpol({
    el: document.querySelector("div"),
    props: {
      x: [-100, 0, "%"],
      opacity: [0, 1],
    },
  })
  ```

## 0.6.0

### Minor Changes

- 1d38bab: Improve beforeStart callback:
  - `beforeStart` get same params than `onUpdate` and `onComplete`:
    ```ts
       beforeStart?: (props?: Record<K, number>, time?: number, progress?: number) => void
    ```
  - A new properties `initUpdate` (boolean) as been added on as Interpol instance property. It allows to execute "onUpdate" callback just before `beforeStart`. Useful in this case, onUpdate will be called once, if the timeline is paused in order to give a position to DOM element.

  New "Menu" example:
  - Test thus new features on a real word example.

## 0.5.3

### Patch Changes

- 92b744d: - Fix timeline first frame exec onUpdate all interpol instances
  - Pause the timeline when Timeline.seek method is called

## 0.5.2

### Patch Changes

- 7060d12: Fix timeline ticker on stop, resume and pause

## 0.5.1

### Patch Changes

- a84ba52: Make no-optional callback params

## 0.5.0

### Minor Changes

- f6806e5: breaking changes: callbacks return properties without object.

  ```js
  new Interpol({
    // Old params
    onUpdate: ({ props, time, progress }) => {},
    onComplete: ({ props, time, progress }) => {},
    // New params
    onUpdate: (props, time, progress) => {},
    onComplete: (props, time, progress) => {},
  })

  new Timeline({
    // ...
    // new Params
    onUpdate: (time, progress) => {},
    onComplete: (time, progress) => {},
  })
  ```

## 0.4.0

### Minor Changes

- e291182: Accept ease as "GSAP like" string name.

  ["GSAP like" ease functions](src/core/ease.ts) are available in interpol as string too:

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

## 0.3.0

### Minor Changes

- 55af122: - Interpol have now 'props' properties in order to get multiple interpolation in one single instance. 'from' and 'to' have been removed.

  ```js
  new Interpol({
    props: {
      x: [0, 100],
      y: [-100, 20],
    },
    onUpdate: ({ props: { x, y }, time, progress }) => {
      // use x and y as needed
    },
  })
  ```

  - Change all TimeLine/Interpol protected properties to #private properties
  - Use terser to get smaller minified bundle (w/ mangle properties mode)

## 0.2.2

### Patch Changes

- ea978dc: Make examples private to avoid publish on npm"

## 0.2.1

### Patch Changes

- ddb504f: Update Timeline constructor & Interpol method in README

## 0.2.0

### Minor Changes

- c597c7b: Improve timeline by using a seek interpol method for each interpolation.
