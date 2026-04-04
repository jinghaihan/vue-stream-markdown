import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import UnoCSS from 'unocss/vite'
import Icons from 'unplugin-icons/vite'

function r(p: string) {
  return resolve(fileURLToPath(new URL('.', import.meta.url)), p)
}

export const alias: Record<string, string> = {
  '@root': r('.'),
  '@markmend/ast': r('packages/markmend-ast/src/index.ts'),
  '@markmend/core': r('packages/markmend/src/index.ts'),
  '@markmend': r('packages/markmend/src'),
  '@shared': r('playground/app/'),
  '@stream-markdown/code': r('packages/internal/code/src/index.ts'),
  '@stream-markdown/math': r('packages/internal/math/src/index.ts'),
  '@stream-markdown/mermaid': r('packages/internal/mermaid/src/index.ts'),
  '@stream-markdown/shared': r('packages/internal/shared/src/index.ts'),
  '@vue-stream-markdown': r('packages/vue-stream-markdown/src'),
  'vue-stream-markdown/package.json': r('packages/vue-stream-markdown/package.json'),
  'vue-stream-markdown/style.css': r('packages/vue-stream-markdown/src/style.css'),
  'vue-stream-markdown': r('packages/vue-stream-markdown/src/index.ts'),
}

export function getPlugins<T = Plugin>(): T[] {
  return [
    UnoCSS(),
    Icons({ compiler: 'vue3' }),
  ] as T[]
}
