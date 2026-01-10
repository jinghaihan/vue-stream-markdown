export function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function isServer(): boolean {
  return typeof window === 'undefined'
}

export function isSupportESM(): boolean {
  if (isServer())
    return false
  return 'noModule' in HTMLScriptElement.prototype === false
}
