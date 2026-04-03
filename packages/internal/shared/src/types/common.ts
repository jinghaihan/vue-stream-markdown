export type MaybeArray<T> = T | T[]

export type MaybeGetter<T> = T | (() => T)

export type MaybePromise<T> = T | Promise<T>
