import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'tsdown'
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  entry: ['./src/index'],
  platform: 'neutral',
  inputOptions: {
    resolve: {
      mainFields: ['module', 'main'],
    },
  },
  external: ['shiki', 'mermaid', 'katex'],
  target: 'chrome89',
  css: {
    splitting: false,
    fileName: 'index.css',
  },
  dts: {
    vue: true,
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
