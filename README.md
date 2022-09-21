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
  onUpdate?: ({ value, time, advancement }: IUpdateParams) => void
  onComplete?: ({ value, time, advancement }: IUpdateParams) => void
  debug?: boolean
}
```

#### constructor:

#####`from`
_number_ - default: `0`  
 Start interpolation value (millisecond)

##### `to`

_number_ - default: `1000`  
 End interpolation value (millisecond)

##### `duration`
_number_ - default: `1000`  
 Interpolation duration between `from` and `to` values (millisecond)
ex: `1000` is 1 second

##### `ease`
_(t:number) => number_ default: `t => t` (lineal easing)  
 ease function

##### `paused`
_boolean_

#####`delay`

##### `onUpdate`

##### `onComplete`

##### `debug`

#### Methods



### Timeline
