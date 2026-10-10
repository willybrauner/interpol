---
"@wbe/interpol": patch
---

Fix `styles()` memory leak: the internal cache is now a `WeakMap`, elements removed from the DOM are no longer retained.

- `styles()` accepts `SVGElement`
- `styles()` no longer accepts plain objects, a leftover of the removed `el` option
