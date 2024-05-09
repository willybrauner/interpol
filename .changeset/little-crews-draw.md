---
"@wbe/interpol": minor
---

Fix: seek multiple times on the same progress

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
