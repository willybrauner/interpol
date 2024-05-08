# @wbe/interpol

## 0.14.0

### Minor Changes

- c275500: Refresh computed values before timeline add() starts.

  Goal of this PR is to update an external variable on the first add() onUpdate and reused it as "from" of the second add(). It will work if "from" of the second add() is a computed value. Behind the scene, we re-execute refreshComputedValues() juste before the add() starts.

  ```ts
  let EXTERNAL_X = 0;

  tl.add({
    ease: "power3.in",
    props: {
      x: [0, 100],
    },
    onUpdate: ({ x }) => {
      // Mute the external value
      EXTERNAL_X = x;
    },
  });
  tl.add({
    props: {
      // Use the updated external value as computed value
      x: [() => EXTERNAL_X, 50],
    },
    onUpdate: ({ x }) => {
      // x will be interpolated from 100 to 50
    },
  });
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
  });
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
      element.style = x + "px";
    },
  });
  ```

## 0.12.1

### Patch Changes

- 89dcd3d: Remove ease string with capitalize first letter

  Remove this ease string:

  ```ts
  "Power1" | "Power2" | "Power3" | "Power4" | "Expo" | "Linear";
  ```

  Prefer using these one:

  ```ts
  "power1" | "power2" | "power3" | "power4" | "expo" | "linear";
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
  });
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
  });
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
  });
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
  });

  tl.seek(1);
  ```

  after:

  ```ts
  const tl: Timeline = new Timeline({
    paused: true,
    // Is executed on seek(1) is suppressTlEvents is false
    onComplete: () => console.log(`tl onComplete!`),
  });

  tl.seek(0, true, false);
  tl.seek(1, true, false);
  ```

  ## Timeline suppressEvents & suppressTlEvents

  `Timeline.seek()` method takes two new arguments: `suppressEvents` & `suppressTlEvents`

  ```ts
    public seek(progress: number, suppressEvents = true, suppressTlEvents = true): void
  ```

  - only execute the timeline event callbacks:

  ```ts
  tl.seek(0.5, true, false);
  ```

  - only execute "Timeline adds" `onComplete` callbacks :

  ```ts
  tl.seek(0.5, false, true);
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
  });

  new Interpol({
    props: { x: [0, 100, "px"] },
    onUpdate: ({ x }) => {
      // in this case "x" is a string, because unit is set.
    },
  });
  ```

  The problem solved, is to make more permissive the prop type in order to set more easily as `number` or `string`.

  Before:

  ```ts
  new Interpol({
    props: { x: [0, 100] },
    onUpdate: ({ x }) => {
      const a: number = x; // TS error because number | string is not compatible to number
    },
  });
  ```

  After:

  ```ts
  new Interpol({
    props: { x: [0, 100] },
    onUpdate: ({ x }) => {
      const a: number = x; // No error
    },
  });
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
  import { InterpolOptions } from "@wbe/interpol";

  // disable internal raf in order to use your own raf
  InterpolOptions.ticker.disable();
  const tick = (e) => {
    // execute Ticker.raf() callback on your own raf
    InterpolOptions.ticker.raf(e);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  ```

  ### Defaults properties

  ```ts
  import { InterpolOptions } from "@wbe/interpol";

  // Set default duration for all Interpol instances
  InterpolOptions.duration = 1000;
  // Set default easing for all Interpol instances
  InterpolOptions.ease = (t) => t * t;
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
  };

  // classic interpolation
  new Interpol({
    props: {
      value: [0, 100],
    },
    onUpdate: ({ value }) => {
      program.uniforms.uProgress.value = value;
    },
  });

  // shortest interpolation with `el` object property
  new Interpol({
    el: program.uniforms.uProgress,
    props: {
      value: [0, 100],
    },
  });
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
  tl.add({}, "+=50");
  tl.add({}, "+50"); // same than "+=50"
  tl.add({}, "50"); // same than "+=50"

  tl.add({}, "-=50");
  tl.add({}, "-50"); // same than "-=50"
  ```

  Absolute offset is a number. This is the absolute position of the `add()` in the timeline.

  ```ts
  tl.add({}, 100);
  tl.add({}, 0); // start at the debut of the timeline
  tl.add({}, -100); // add duration - 100
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
      element.style.top = top;
    },
  });
  ```

  - Add `styles`, a core helper function to simplify the DOM style manipulation

  ```ts
  import { Interpol, styles } from "./Interpol";

  new Interpol({
    props: {
      x: [-100, 0, "%"],
      opacity: [0, 1],
    },
    onUpdate: ({ x, opacity }) => {
      styles(element, { x, opacity });

      // Is Equivalent to:
      // element.style.transform = `translate3d(${x}%, 0px, 0px)`
      // element.style.opacity = opacity
    },
  });
  ```

  - Add `el` property to set the DOM element to animate directly in the Interpol constructor.

  ```ts
  new Interpol({
    el: document.querySelector("div"),
    props: {
      x: [-100, 0, "%"],
      opacity: [0, 1],
    },
  });
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
  });

  new Timeline({
    // ...
    // new Params
    onUpdate: (time, progress) => {},
    onComplete: (time, progress) => {},
  });
  ```

## 0.4.0

### Minor Changes

- e291182: Accept ease as "GSAP like" string name.

  ["GSAP like" ease functions](./packages/interpol/src/core/ease.ts) are available in interpol as string too:

  ```js
  import { Interpol, Power3 } from "@wbe/interpol";

  // as typed string
  new Interpol({
    ease: "power3.out",
  });

  // or, import the object
  new Interpol({
    ease: Power3.out,
  });
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
  });
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
