# @wbe/interpol

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
