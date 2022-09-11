export type TDeferredPromise<T = any> = {
  promise: Promise<T>
  resolve: (resolve?: T) => void
  reject: (error?: Error | any) => void
}

/**
 * @name deferredPromise
 * @return TDeferredPromise
 */
export function deferredPromise<T>(): TDeferredPromise<T> {
  const deferred: TDeferredPromise<T> | any = {}

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })

  return deferred
}
