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
  outputOptions: {
    minify: true,
  },
  inlineOnly: false,
  external: [
    'shiki',
    'mermaid',
    'beautiful-mermaid',
    'katex',
  ],
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
