---
"@wbe/interpol": minor
---

Improve performances

### Code Organization & Structure

- Remove duplicated logic in Timeline play
- Internalize events inside the `Ticker` class
- Inline all closures from `onEachProps` & `onAllAdds`
- Remove deprecated `refreshComputedValues` in `Timeline` and `Interpol`

### Optimization

- Optimize `styles` function using `for` loop instead of regex
- Use a `for` loop in the `raf` method
- Cache `Object.keys` / `Object.values` results in `refresh` to reduce allocations
- Rewrite `chooseEase` and create `EASE_MAP` outside `easeAdapter` to avoid recreation on each call
- Remove `async` from `handleTick` methods

### Debug

- Guard debug log: only build the log object when debug is enabled
- Prevent unnecessary promise creation when `Interpol` is instantiated from `Timeline`

### Async & Timing

- Replace `setTimeout` with `queueMicrotask` in `Ticker` and `Timeline.add`
