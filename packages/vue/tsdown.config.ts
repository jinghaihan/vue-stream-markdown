import process from 'node:process'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'tsdown'
import ApiSnapshot from 'tsnapi/rolldown'
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  entry: ['./src/index'],
  platform: 'neutral',
  dts: {
    vue: true,
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
    ...(process.env.CI ? [] : [ApiSnapshot()]),
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
