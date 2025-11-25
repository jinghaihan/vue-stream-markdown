import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { alias, getPlugins } from './shared'

export default defineConfig({
  root: './playground',
  plugins: [Vue(), ...getPlugins()],
  resolve: { alias },
})
