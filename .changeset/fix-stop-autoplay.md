---
"@wbe/interpol": patch
---

Fix Timeline autoplay not being canceled by an explicit call made synchronously after `add()`. An explicit `stop()`, `play()` or `reverse()` now cancels the pending autoplay.

Before:

```ts
const tl = new Timeline()
tl.add({ /* ... */ })
// ignored: the timeline was played anyway by the autoplay,
// and stayed registered in the ticker
tl.stop()
```

After:

```ts
const tl = new Timeline()
tl.add({ /* ... */ })
// cancels the pending autoplay: the timeline stays stopped
tl.stop()
```

Same for `reverse()`, which was switched back to forward by the autoplay and now stays reversed.

To dispose an instance, `stop()` it and drop your reference: nothing else retains it.
