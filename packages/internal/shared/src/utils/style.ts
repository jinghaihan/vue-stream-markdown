export function normalizeCssSize(size: number | string | undefined): string | undefined {
  if (size === undefined)
    return undefined
  return typeof size === 'number' ? `${size}px` : size
}
