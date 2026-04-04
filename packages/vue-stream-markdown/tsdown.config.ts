import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'tsdown'
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  entry: ['./src/index'],
  tsconfig: './tsconfig.build.json',
  platform: 'neutral',
  dts: {
    vue: true,
  },
  deps: {
    alwaysBundle: [/^@stream-markdown\//],
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
