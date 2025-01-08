---
"@wbe/interpol": minor
---

## Back to basic Interpol instance functionalities

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
