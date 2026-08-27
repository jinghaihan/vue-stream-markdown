export function normalizeCssSize(size: number | string | undefined): string | undefined {
  if (size === undefined)
    return undefined
  return typeof size === 'number' ? `${size}px` : size
}

export function resolveScrollableMaxHeight(
  maxHeight: number | string | undefined,
): string | undefined {
  if (maxHeight === undefined || maxHeight === 0 || maxHeight === Number.POSITIVE_INFINITY)
    return undefined

  if (typeof maxHeight === 'number')
    return Number.isFinite(maxHeight) && maxHeight > 0 ? `${maxHeight}px` : undefined

  if (maxHeight === '0' || maxHeight === 'none' || maxHeight === 'Infinity')
    return undefined

  return maxHeight
}
