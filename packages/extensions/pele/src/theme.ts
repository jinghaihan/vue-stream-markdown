import type { PeleColors, ShikiThemeLike } from './types'

const LIGHT_COLORS: Required<PeleColors> = {
  'bg': '#ffffff',
  'fg': '#1f1f1f',
  'line': '#1f1f1f',
  'accent': '#5b7bd5',
  'muted': '#6e6e6e',
  'surface': '#f3f3f3',
  'surface-alt': '#e6e6e6',
  'border': '#8a8a8a',
}

const DARK_COLORS: Required<PeleColors> = {
  'bg': '#0d1117',
  'fg': '#e6edf3',
  'line': '#8b949e',
  'accent': '#58a6ff',
  'muted': '#8b949e',
  'surface': '#161b22',
  'surface-alt': '#21262d',
  'border': '#484f58',
}

interface ThemeToken {
  scope?: string | string[]
  settings?: { foreground?: string }
}

const HEX_COLOR = /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i

function hexColor(value: unknown) {
  return typeof value === 'string' && HEX_COLOR.test(value) ? value : undefined
}

function tokenColor(tokens: unknown, name: string) {
  if (!Array.isArray(tokens))
    return undefined

  for (const token of tokens as (ThemeToken | undefined)[]) {
    const scopes = Array.isArray(token?.scope) ? token.scope : [token?.scope]
    if (scopes.some(scope => typeof scope === 'string' && (scope === name || scope.startsWith(`${name}.`)))) {
      const foreground = hexColor(token?.settings?.foreground)
      if (foreground)
        return foreground
    }
  }
}

/** Convert a loaded Shiki theme to Pele color overrides. */
export function fromShikiTheme(theme: ShikiThemeLike): PeleColors {
  const colors = theme.colors as Record<string, unknown> | undefined
  const line = hexColor(colors?.['editorLineNumber.foreground'])
  const tokens = theme.tokenColors ?? theme.settings
  return {
    bg: hexColor(colors?.['editor.background']) ?? hexColor(theme.bg),
    fg: hexColor(colors?.['editor.foreground']) ?? hexColor(theme.fg),
    line,
    accent: hexColor(colors?.focusBorder) ?? tokenColor(tokens, 'keyword'),
    muted: tokenColor(tokens, 'comment') ?? line,
    surface: hexColor(colors?.['editor.selectionBackground']),
    border: hexColor(colors?.['editorWidget.border']),
  }
}

export function getPeleStyle(
  isDark: boolean,
  theme: Record<string, unknown> | null | undefined,
  overrides: PeleColors | undefined,
): string {
  const mapped = theme && fromShikiTheme(theme)
  const fallback = isDark ? DARK_COLORS : LIGHT_COLORS
  return (Object.keys(fallback) as (keyof PeleColors)[]).map((key) => {
    const color = hexColor(overrides?.[key]) ?? mapped?.[key] ?? fallback[key]
    return `--pele-${key}:${color};`
  }).join('')
}
