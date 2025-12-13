export function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function isServer(): boolean {
  return typeof window === 'undefined'
}
