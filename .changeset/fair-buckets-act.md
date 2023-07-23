---
"@wbe/interpol": minor
---

- Interpol have now 'props' properties in order to get multiple interpolation in one single instance. 'from' and 'to' have been removed.

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
