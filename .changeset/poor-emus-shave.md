---
"@wbe/interpol": minor
---

el property accepts object

`el` property can received an object element instead of an HTMLElement:

```ts
const program = { 
  uniforms: { 
    uProgress: { 
      value: 0 
    } 
  } 
}

// classic interpolation
new Interpol({
  props: {
    value: [0, 100],
  },
  onUpdate: ({ value }) =>  {
    program.uniforms.uProgress.value = value
  }
})

// shortest interpolation with `el` object property
new Interpol({
  el: program.uniforms.uProgress,
  props: {
    value: [0, 100],
  }
})
```
