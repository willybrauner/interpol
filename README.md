# Interpol 👮🏽‍

@wbe/interpol library interpol value between two points.
This is the lowest level of animate machine.
Interpol comes without DOM API, it provides a real time advancement of the interpolation that can be use or bind
on... anything!

## Why

I use GSAP for a long time, but I often no need all features provided. Interpol is low level,
it can be used as in most of the cases for only ~= 3k gzip.

### Interpol

```js
const itp = new Interpol({
  from: 0,
  to: 100,
  duration: 1000,
  paused: true,
  onUpdate: () => {},
  onComplete: () => {},
})
```

### Timeline

```js
const itp1 = new Interpol({
  from: 0,
  to: 100,
  duration: 1000,
})
const itp2 = new Interpol({
  from: 0,
  to: 500,
  duration: 7000,
})

const tl = new Timeline()
tl.add(itp1)
tl.add(itp2)
```

## API

### interpol

constructor:

```ts
interface IInterpolConstruct {
  from?: number
  to: number
  duration?: number
  ease?: (t: number) => number
  paused?: boolean
  delay?: number
  yoyo?: boolean
  onUpdate?: ({ value, time, advancement }: IUpdateParams) => void
  onComplete?: ({ value, time, advancement }: IUpdateParams) => void
  debug?: boolean
}
```

#### from

`number` - default: `0`

Start interpolation value (millisecond)

#### to

`number` - default: `1000`

End interpolation value (millisecond)

#### duration

`number` - default: `1000`

Interpolation duration between `from` and `to` values (millisecond). ex: `1000` is 1 second

#### ease

`(t:number) => number` - default: `t => t` (lineal easing)

ease function

#### paused

`boolean` - default: `false`

#### delay

`number` - default: `0`

#### onUpdate

`({ time, delta, advancement }) => void`

#### onComplete

`({ time, delta, advancement }) => void`

#### yoyo

`boolean` - default: `false`

Start and reverse indefinitely

#### debug

`boolean` - default: `false`

Methods

#### play(): Promise<any>

Play the current interpol

#### pause(): void

Pause the current interpol

#### stop(): void

Stop the current interpol, will reset time, delta and advancement.

#### replay(): void

Replay from start the current interpol.

#### reverse(): void

Reverse the current interpol

---

### Timeline
