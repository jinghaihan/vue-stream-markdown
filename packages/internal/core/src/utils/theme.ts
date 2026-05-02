const CSS_COLOR_FUNCTION_PATTERN = /^(?:hsl|rgb|oklch|lab|lch)\(/

export function normalizeThemeVariableValue(value: string): string | undefined {
  const normalizedValue = value.trim()
  if (!normalizedValue || CSS_COLOR_FUNCTION_PATTERN.test(normalizedValue))
    return undefined

  return `hsl(${normalizedValue})`
}

export function resolveThemeVariables(
  schemas: readonly string[],
  getPropertyValue: (name: string) => string,
): Record<string, string> {
  const variables: Record<string, string> = {}

  for (const schema of schemas) {
    const name = `--${schema}`
    const value = normalizeThemeVariableValue(getPropertyValue(name))
    if (value)
      variables[name] = value
  }

  return variables
}
