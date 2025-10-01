---
"@wbe/interpol": minor
---

Transform delay as a computed property

`delay`property can now be used as a computed property, like props values & duration.

```ts
const itp = new Interpol({
  delay: () => Math.random() * 1000,
})

itp.refreshComputedValues()
```
