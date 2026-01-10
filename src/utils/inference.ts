export function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function isServer(): boolean {
  return typeof window === 'undefined'
}

export function isSupportESM(): boolean {
  if (isServer())
    return false
  const script = document.createElement('script')
  return 'noModule' in script
}
