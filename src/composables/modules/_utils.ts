import { isSupportESM } from '../../utils'

export type ModuleStrategy = 'esm' | 'umd'

export function dynamicImport<T>(url: string): Promise<T> {
  // eslint-disable-next-line no-new-func
  return new Function('url', 'return import(url)')(url) as Promise<T>
}

export function getModuleStrategy(option?: ModuleStrategy | boolean): ModuleStrategy {
  return option === 'umd' ? 'umd' : 'esm'
}

export function isModuleEnabled(option?: ModuleStrategy | boolean): boolean {
  return option !== false
}

export function getModuleFromImport<T>(module: T, globalVar: keyof Window | undefined): T | null {
  if (isSupportESM() || !globalVar)
    return module
  return (window as any)[globalVar] ?? null
}
