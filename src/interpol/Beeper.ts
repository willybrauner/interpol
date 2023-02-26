type THandler<S> = (state?: S) => void
type TListeners<S> = (THandler<S> | void)[]
type TOff<S> = (handler: THandler<S>) => void
type TBeeper<S = any> = {
  off: TOff<S>
  on: (handler: THandler<S>) => void
  dispatch: (state: S) => TListeners<S>
  get state(): S
}

/**
 * Beeper
 * @param initialState
 */
export function Beeper<S = any>(initialState: S = null): TBeeper<S> {
  let listeners: TListeners<S> = []
  let currentState: S = initialState
  return {
    off: (handler: THandler<S>) => {
      listeners = listeners.filter((e) => e !== handler)
    },
    on: (handler: THandler<S>) => {
      listeners.push(handler)
    },
    dispatch: (state: S) => {
      currentState = state
      return listeners.map((e: THandler<S>) => e(state))
    },
    get state() {
      return currentState
    },
  }
}
