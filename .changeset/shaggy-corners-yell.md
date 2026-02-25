---
"@wbe/interpol": minor
---

Nested timelines support

This branch implements full **nested timelines** support, allowing `Timeline.add()` to accept a `Timeline` instance in addition to `Interpol` and callbacks. We can now use ulimited nested timelines/interpols to create complex and flexibles animations by timeline chunks!

```typescript
const tl1 = new Timeline()
tl1.add({ x: 500 })

const tl2 = new Timeline()
tl2.add({ y: 100 })

// Add All to a parent timeline
const main = new Timeline()
main.add(tl1)
main.add(tl2, "-=100")

// start the whole sequence
main.play()
```

We can imagine some others complex structures like this one:

```text
Timeline (main)
│
├── Timeline (tl1)
│ ├── Interpol { x: 500 }
│ └── Timeline (tl1-1)
│     └── Interpol { x: [...] }
│     └── Interpol { x: [...] }
│     └── Timeline (tl1-2)
│         └── Interpol { x: [...] }
│         └── Interpol { x: [...] }
│
├── Timeline (tl2)
│ └── Interpol { x: [...] }
│
├── Interpol { opacity: [...] }
└── Timeline (tl3)
  └── Interpol { y: [...] }
```

## Changes

- (BREAKING CHANGE) `timeline.add.itp` has been renamed to `timeline.add.instance` because it can now be an `Interpol` or a `Timeline` instance.
- Removed Timeline `adds` console log when `new Timeline({ debug: true })` is used — `adds` still accessible via `console.log(tl.adds)` if needed

## Internal changes

- `inTl` flag and `ticker` reference are recursively propagated to all children (including Timeline children of Timeline children)
- `suppressTlEvents` parameter added to `#updateAdds()` to correctly fire nested Timeline `onComplete()` callbacks during live playback

## Tests

- Unit tests are available in `Timeline.nested.test.ts`
- Visual example added: `examples/timeline-nested/` demonstrates real-world nested timeline animation

https://github.com/user-attachments/assets/28187857-aa66-48ef-b1fb-1bcc43b9fb2e
