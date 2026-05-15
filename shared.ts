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
  '@markmend/ast': r('packages/markmend/ast/src/index.ts'),
  '@markmend/core': r('packages/markmend/core/src/index.ts'),
  '@markmend': r('packages/markmend/core/src'),
  '@shared': r('playground/nuxt/app/'),
  '@stream-markdown/core': r('packages/core/src/index.ts'),
  '@stream-markdown/code': r('packages/extensions/code/src/index.ts'),
  '@stream-markdown/math': r('packages/extensions/math/src/index.ts'),
  '@stream-markdown/mermaid': r('packages/extensions/mermaid/src/index.ts'),
  '@vue-stream-markdown': r('packages/vue/src'),
  'vue-stream-markdown/package.json': r('packages/vue/package.json'),
  'vue-stream-markdown/style.css': r('packages/vue/src/style.css'),
  'vue-stream-markdown': r('packages/vue/src/index.ts'),
}

export function getPlugins<T = Plugin>(): T[] {
  return [
    UnoCSS(),
    Icons({ compiler: 'vue3' }),
  ] as T[]
}
