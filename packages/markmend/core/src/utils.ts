export function flow<T>(fns: Array<(arg: T) => T>): (arg: T) => T {
  return (input: T) => fns.reduce((acc, fn) => fn(acc), input)
}
