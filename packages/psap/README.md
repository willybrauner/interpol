# psap

## Install

```shell
$ npm i @psap/psap
```

## tween

```js
import { psap } from "@psap/psap"

psap.to(elements, {
  x: 10,
  y: 10,
  stagger: 0.01,
  duration: 1.5,
  ease: (t) => t,
  beforeStart: () => {},
  onUpdate: ({ time, value, progress }) => {},
  onComplete: () => {},
})
```

### tween API

...

## timeline

...

