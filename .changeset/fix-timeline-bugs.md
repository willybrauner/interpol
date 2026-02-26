---
"@wbe/interpol": patch
---

Fix two Timeline bugs affecting real RAF playback

- When `round()` snaps `#progress` to `1` slightly before `#time` reaches `#tlDuration` (ex: `999.8ms` of `1000ms`). `onComplete` could be never triggered.
- `#lastTlProgress` and `#reverseLoop` were never reset in `stop()` or `play()`
