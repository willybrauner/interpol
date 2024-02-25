---
"@wbe/interpol": minor
---

Fix seek method and rework event callbacks on Interpol & Timeline

This PR reveal allows Timeline `onComplete()`exec when using `tl.seek()` method. A major bug has been discovered about the seek method who wasn't working as expected, and is fixed in this PR too.

## event callbacks

before:

```ts
const tl: Timeline = new Timeline({
  paused: true,
  // wasn't called with seek method
  onComplete: () => console.log(`tl onComplete!`),
})

tl.seek(1)
```

after:

```ts
const tl: Timeline = new Timeline({
  paused: true,
  // Is executed on seek(1) is suppressTlEvents is false
  onComplete: () => console.log(`tl onComplete!`)
})

tl.seek(0, true, false)
tl.seek(1, true, false) 
```

## Timeline suppressEvents & suppressTlEvents

`Timeline.seek()` method takes two new arguments: `suppressEvents` & `suppressTlEvents`

```ts
  public seek(progress: number, suppressEvents = true, suppressTlEvents = true): void
```

- only execute the timeline event callbacks:

```ts
tl.seek(0.5, true, false)
```

- only execute "Timeline adds" `onComplete` callbacks :

```ts
tl.seek(0.5, false, true)
```

`suppressEvents` params as been copied from gsap API. On the other hand, `suppressTlEvents` doesn't exist in GSAP.

Example of **Timeline**: with `suppressEvents = false` and `suppressTlEvents = false` we have the same behavior on play/reverse and on seek:
https://github.com/willybrauner/interpol/assets/7604357/414cb316-cf69-4d24-bcba-5ec267427efa

## Interpol suppressEvents

In the same way, Interpol `suppressEvents` is available (default: true)

```ts
  public seek(progress: number, suppressEvents = true): void
```

Example of **Interpol**: with `suppressEvents = false` we have the same behavior on play/reverse on seek:
https://github.com/willybrauner/interpol/assets/7604357/96601416-2679-46ea-b918-dfd4559bc7c7

## Callback executions logic

- in Interpol and In Timeline, `onComplete` is called only on play and seek(1)
- `onReverseComplete` should be create for the reverse purpose

## TODO in other PRs

- create `onReverseComplete`
- exec beforeStart() too
