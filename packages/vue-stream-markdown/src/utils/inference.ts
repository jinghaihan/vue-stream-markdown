let supportESM = false

export function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function isServer(): boolean {
  return typeof window === 'undefined'
}

export function isSupportESM(): boolean {
  if (isServer())
    return false
  if (supportESM)
    return true
  const script = document.createElement('script')
  supportESM = 'noModule' in script
  return supportESM
}
