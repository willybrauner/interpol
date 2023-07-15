type THandler<S> = (state?: S) => void
type TListeners<S> = (THandler<S> | void)[]
type TOff<S> = (handler: THandler<S>) => void
type TBeeper<S = any> = {
  off: TOff<S>
  on: (handler: THandler<S>) => void
  dispatch: (state: S) => TListeners<S>
  }

/**
 * Beeper
 */
export function Beeper<S = any>(): TBeeper<S> {
  let listeners: TListeners<S> = []
  return {
    off: (handler: THandler<S>) => {
      listeners = listeners.filter((e) => e !== handler)
    },
    on: (handler: THandler<S>) => {
      listeners.push(handler)
    },
    dispatch: (state: S) => {
      return listeners.map((e: THandler<S>) => e(state))
    }
  }
}
