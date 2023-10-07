---
"@wbe/interpol": minor
---

TL accepts relative and absolute offset

`offset` of  `add({}, offset)` should be relative or absolute

Relative offset (until this PR, offset was a number offset syntaxe)
The new relative offset should be a string, according to the GSAP API.

 ```ts
 tl.add({}, "+=50")
 tl.add({}, "+50") // same than "+=50"
 tl.add({}, "50") // same than "+=50"

 tl.add({}, "-=50")  
 tl.add({}, "-50") // same than "-=50"
```

Absolute offset is a number. This is the absolute position of the `add()` in the timeline.

```ts
 tl.add({}, 100)
 tl.add({}, 0) // start at the debut of the timeline
 tl.add({}, -100)  // add duration - 100
```


- [x] adapt examples using relative offset with `number`
- [x] create new example with input to set offset manually
- [x] update readme
- [x] ~~<{offset} |  >{offset}~~
- [x] unit tests


