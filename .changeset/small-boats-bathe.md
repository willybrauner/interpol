---
"@wbe/interpol": minor
---

Create a low level DOM API.

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
