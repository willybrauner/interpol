---
"@wbe/interpol": minor
---

in addition to having an effect on the duration of the interpolation, `InterpolOptions.durationFactor` impact now `delay` & `offset` too.

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
