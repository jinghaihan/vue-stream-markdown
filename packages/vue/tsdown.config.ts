import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'tsdown'
import ApiSnapshot from 'tsnapi/rolldown'
import Icons from 'unplugin-icons/vite'

const compilerOptions = {
  skipLibCheck: true,
  stableTypeOrdering: true,
}

export default defineConfig({
  entry: ['./src/index'],
  platform: 'neutral',
  dts: {
    vue: true,
    compilerOptions,
  },
  deps: {
    onlyBundle: false,
    neverBundle: [
      'shiki',
      'mermaid',
      'beautiful-mermaid',
      'katex',
    ],
  },
  css: {
    splitting: false,
    fileName: 'index.css',
  },
  inputOptions: {
    resolve: {
      mainFields: ['module', 'main'],
    },
  },
  outputOptions: {
    minify: true,
  },
  plugins: [
    ApiSnapshot(),
    Vue(),
    Icons({ compiler: 'vue3' }),
  ],
  copy: [
    {
      from: ['./src/theme.css'],
      to: './dist',
    },
  ],
})
