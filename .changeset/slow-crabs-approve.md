---
"@wbe/interpol": minor
---

Improve beforeStart callback:

- `beforeStart` get same params than `onUpdate` and `onComplete`:
  ```ts
     beforeStart?: (props?: Record<K, number>, time?: number, progress?: number) => void
  ```
- A new properties `initUpdate` (boolean) as been added on as Interpol instance property. It allows to execute "onUpdate" callback just before `beforeStart`. Useful in this case, onUpdate will be called once, if the timeline is paused in order to give a position to DOM element.

New "Menu" example:

- Test thus new features on a real word example.
