---
"@wbe/interpol": patch
---

Fix `styles()` memory leak: the internal cache is now a `WeakMap`, elements removed from the DOM are no longer retained.

- `styles()` accepts `SVGElement` and arrays of plain objects
- Fix a `TypeError` when a transform key (`x`, `rotate`, `scale`…) was set on a plain object
