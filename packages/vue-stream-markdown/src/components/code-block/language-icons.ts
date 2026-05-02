import type { BuiltinLanguage, SpecialLanguage } from 'shiki'
import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

/// keep-sorted
export const LANGUAGE_ICONS: Partial<Record<BuiltinLanguage | SpecialLanguage, Component>> = {
  css: defineAsyncComponent(() => import('~icons/simple-icons/css')),
  html: defineAsyncComponent(() => import('~icons/simple-icons/html5')),
  javascript: defineAsyncComponent(() => import('~icons/simple-icons/javascript')),
  js: defineAsyncComponent(() => import('~icons/simple-icons/javascript')),
  jsx: defineAsyncComponent(() => import('~icons/simple-icons/react')),
  less: defineAsyncComponent(() => import('~icons/simple-icons/css')),
  markdown: defineAsyncComponent(() => import('~icons/simple-icons/markdown')),
  md: defineAsyncComponent(() => import('~icons/simple-icons/markdown')),
  mermaid: defineAsyncComponent(() => import('~icons/simple-icons/mermaid')),
  mjs: defineAsyncComponent(() => import('~icons/simple-icons/javascript')),
  mmd: defineAsyncComponent(() => import('~icons/simple-icons/mermaid')),
  mts: defineAsyncComponent(() => import('~icons/simple-icons/typescript')),
  py: defineAsyncComponent(() => import('~icons/simple-icons/python')),
  python: defineAsyncComponent(() => import('~icons/simple-icons/python')),
  rs: defineAsyncComponent(() => import('~icons/simple-icons/rust')),
  rust: defineAsyncComponent(() => import('~icons/simple-icons/rust')),
  sass: defineAsyncComponent(() => import('~icons/simple-icons/css')),
  scss: defineAsyncComponent(() => import('~icons/simple-icons/css')),
  ts: defineAsyncComponent(() => import('~icons/simple-icons/typescript')),
  tsx: defineAsyncComponent(() => import('~icons/simple-icons/react')),
  typescript: defineAsyncComponent(() => import('~icons/simple-icons/typescript')),
  vue: defineAsyncComponent(() => import('~icons/simple-icons/vuedotjs')),
} as const
