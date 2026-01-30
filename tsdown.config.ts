import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'tsdown'
import Icons from 'unplugin-icons/vite'
import LightningCSS from 'unplugin-lightningcss/rolldown'

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
    LightningCSS({
      options: {
        targets: {
          chrome: 89,
        },
        minify: true,
      },
    }),
  ],
  copy: [
    {
      from: ['./src/theme.css'],
      to: './dist',
    },
  ],
})
