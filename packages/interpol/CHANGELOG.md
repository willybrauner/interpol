# @wbe/interpol

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

  ["GSAP like" ease functions](./packages/interpol/src/core/ease.ts) are available in interpol as string too:

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
