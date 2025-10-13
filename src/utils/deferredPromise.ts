export type TDeferredPromise<T = any> = {
  promise: Promise<T>
  resolve: (resolve?: T) => void
}

/**
 * @name deferredPromise
 * @return TDeferredPromise
 */
export function deferredPromise<T>(): TDeferredPromise<T> {
  const deferred: TDeferredPromise<T> | any = {}
  deferred.promise = new Promise((resolve) => {
    deferred.resolve = resolve
  })
  return deferred
}
