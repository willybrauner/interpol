type THandler<S> = (state?: S) => void

type TListeners<S> = (THandler<S>|void)[]

type TOff<S> = (handler: THandler<S>) => void

type TBeeper<S = any> = {
  off: TOff<S>
  on: (handler: THandler<S>) => TOff<S>
  dispatch: (state: S) => TListeners<S>
  clear: () => void
  get state (): S
  get listeners (): TListeners<S>
}

/**
 * Beeper
 * @param initialState 
 * @returns 
 */
export function Beeper<S = any>(initialState: S = null): TBeeper<S> {
  let listeners: TListeners<S> = []
  let currentState: S = initialState

  const off = (handler: THandler<S>): void => {
    listeners = listeners.filter((e) => e !== handler)
  }

  const on = (handler: THandler<S>): TOff<S> => {
    listeners.push(handler)
    return () => off(handler)
  }

  const dispatch = (state: S): TListeners<S> => {
    currentState = state
    return listeners.map((e:THandler<S>) => e(state))
  }

  const clear = (): void => {
    listeners = []
  }

  return {
    off,
    on,
    dispatch,
    clear,
    get state() { return currentState },
    get listeners() { return listeners }
  }
}
