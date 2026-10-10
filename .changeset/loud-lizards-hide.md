---
"@wbe/interpol": minor
---

Fix `styles()` memory leak: the internal cache is now a `WeakMap`, elements removed from the DOM are no longer retained.

- `styles()` accepts `SVGElement`

- (breaking change) `styles()` no longer accepts plain objects, a leftover of the removed `el` option
