import type { ComputedRef, InjectionKey } from 'vue'

interface CodeViewportContext {
  element: ComputedRef<HTMLElement | undefined>
  bounded: ComputedRef<boolean>
}

export const CODE_VIEWPORT_CONTEXT: InjectionKey<CodeViewportContext> = Symbol('code-viewport')
