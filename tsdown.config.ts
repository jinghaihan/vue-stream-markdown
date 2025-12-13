import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'tsdown'
import Icons from 'unplugin-icons/vite'

export default defineConfig([
  {
    entry: ['./src/index'],
    target: 'chrome89',
    platform: 'neutral',
    inputOptions: {
      resolve: {
        mainFields: ['module', 'main'],
      },
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
        from: './src/index.css',
        to: './dist/index.css',
      },
      {
        from: './src/theme.css',
        to: './dist/theme.css',
      },
    ],
  },
])
