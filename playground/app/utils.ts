import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isRegExp(value: any): boolean {
  return Object.prototype.toString.call(value) === '[object RegExp]'
}

export function filterObjectKeys(ast: unknown, exclude: string[]) {
  const seen = new WeakMap<any, unknown>()
  return JSON.stringify(
    ast,
    (key: string, value: unknown) => {
      if ([...exclude.filter(v => !!v)].includes(key))
        return

      if (typeof value === 'function')
        return `function ${value.name}(...)`
      if (typeof value === 'bigint')
        return `(BigInt) ${value}n`
      if (isRegExp(value))
        return `(RegExp) ${value}`

      if (seen.has(value)) {
        return seen.get(value)
      }

      if (value !== null && typeof value === 'object') {
        let newValue: any
        try {
          JSON.stringify(value)
          newValue = value
        }
        catch {
          newValue = `(circular: ${key || '#root'})`
        }
        seen.set(value, newValue)
      }

      return value
    },
    2,
  )
}

export function getContentFromUrl(url: string = ''): string {
  const params = new URLSearchParams(url.split('?')[1])
  return params.get('content') || ''
}
