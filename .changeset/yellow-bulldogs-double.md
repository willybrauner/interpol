---
"@wbe/interpol": minor
---

Rename `initUpdate` by `immediateRender` to be as close as possible to the gsap API.
In this example,  `paused` is set to `true`, then, the interpol will not be played automatically. But, if we want to init the style of `element.style` to the `from` value even if the interpol is not running, we have to set `immediateRender: true`:

```ts
new Interpol({
  paused: true,
  immediateRender: true,
  props: {
    x: [0, 1]
  },
  onUpdate: ({ x }) => {
    element.style = x + "px"
  }
})
```
