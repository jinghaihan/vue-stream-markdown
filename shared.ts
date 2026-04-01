import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import UnoCSS from 'unocss/vite'
import Icons from 'unplugin-icons/vite'

function r(p: string) {
  return resolve(fileURLToPath(new URL('.', import.meta.url)), p)
}

export const alias: Record<string, string> = {
  'markmend': r('packages/markmend/src/index.ts'),
  'vue-stream-markdown/package.json': r('packages/vue-stream-markdown/package.json'),
  'vue-stream-markdown/style.css': r('packages/vue-stream-markdown/src/style.css'),
  'vue-stream-markdown': r('packages/vue-stream-markdown/src/index.ts'),
  '@shared': r('playground/app/'),
}

export function getPlugins<T = Plugin>(): T[] {
  return [
    UnoCSS(),
    Icons({ compiler: 'vue3' }),
  ] as T[]
}
