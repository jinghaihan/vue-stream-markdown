declare interface Window {
  mermaid?: typeof import('mermaid')
  beautifulMermaid?: typeof import('beautiful-mermaid')
  katex?: typeof import('katex')
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent
  export default component
}
