---
"@wbe/interpol": minor
---

Prop should accept multi types


- Prop accept single 'to' `number` instead of [from, to] `array`.

```ts
 new Interpol({
  props: {
    x: 1000, // is equivalent to [0, 1000]
  },   
})
```

- Props accept object instead of [from, to] `array`.

```ts
 new Interpol({
  props: {
    x: {
      from: 0, 
      to: 1000,
      unit: "px",
    } // is equivalent to [0, 1000, "px"]
  },   
})
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
    } 
  },   
})
```
