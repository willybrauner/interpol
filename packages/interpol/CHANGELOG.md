# @wbe/interpol

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
