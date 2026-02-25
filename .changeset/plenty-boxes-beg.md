---
"@wbe/interpol": patch
---

add timeline meta property

Add timeline meta property to get the same struct than Interpol instance.

```ts
new Timeline({
  meta: { foo: "bar" },
})
```

This allows to get `meta` from an "add.instance" without TypeScript cast issue (because `instance` refer to Timeline or Interpol since the last release).

ex:

```ts
const tl = new Timeline()
tl.add(new Timeline({ meta: {...} }))
tl.add(new Interpol({ meta: {...} }))
tl.adds[0].instance.meta // valid, it can be meta from Timeline or Interpol instance here.
```
