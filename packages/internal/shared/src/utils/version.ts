const VERSION_RANGE_PREFIX_PATTERN = /^[~^]/

export function stripVersionRangePrefix(version: string): string {
  return version.replace(VERSION_RANGE_PREFIX_PATTERN, '')
}
