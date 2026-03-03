---
"@wbe/interpol": patch
---

Fix: callbacks with position 0 should be fired properly on replay

This PR fix two unexpected behaviours:

- Callbacks with position 0 should be fired properly on replay and play → stop → play
- Timeline with nested timeline should reset their nested timeline position on stop

```ts
const tl = new Timeline()

tl.add(() => {
  // was not fired properly on replay and play → stop → play
  console.log("Fired on position 0")
})

tl.add({
  // ...
})

// Replay during play
tl.play()
setTimeout(() => {
  tl.play()
}, 50)

// play → stop → play
tl.play()
setTimeout(() => {
  tl.stop()
  tl.play()
}, 50)
```

## Internal Changes

- When resetting timelines on play/replay, we now check if the child timeline is already at the target position before resetting it. This prevents unnecessary resets and preserves computed-from values on first play.
- Internal Timeline reset logic has been refactored to ensure that children timelines are properly reset to their initial state
- Tests have been added to verify that nested timelines are reset properly on play/replay and that callbacks at position 0 are fired correctly.
