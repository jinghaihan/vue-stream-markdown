const MIDDLE_DOLLAR_PATTERN = /[^$]\$[^$]/
const START_DOLLAR_PATTERN = /^\$[^$]/
const END_DOLLAR_PATTERN = /[^$]\$$/

export function flow<T>(fns: Array<(arg: T) => T>): (arg: T) => T {
  return (input: T) => fns.reduce((acc, fn) => fn(acc), input)
}

export function checkMathSyntax(content: string, singleDollarEnabled: boolean = false): boolean {
  const hasDoubleDollar = content.includes('$$')
  const hasSingleDollar
    = singleDollarEnabled
      && (MIDDLE_DOLLAR_PATTERN.test(content)
        || START_DOLLAR_PATTERN.test(content)
        || END_DOLLAR_PATTERN.test(content))
  return hasDoubleDollar || hasSingleDollar
}
