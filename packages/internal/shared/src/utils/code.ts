import type { CodeOptions, CodeOptionsLanguage } from '../types'

export function resolveCodeOptions<TComponent = unknown>(
  codeOptions: CodeOptions<TComponent> | undefined,
  language: string,
): CodeOptionsLanguage<TComponent> {
  const specificOptions = codeOptions?.language?.[language]
  return {
    ...(codeOptions ?? {}),
    ...(specificOptions ?? {}),
  }
}

export function isCodeOptionEnabled(value: unknown, defaultValue: boolean = true): boolean {
  return typeof value === 'boolean' ? value : defaultValue
}
