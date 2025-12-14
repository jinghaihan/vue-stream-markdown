import type loader from '@monaco-editor/loader'
import type { BuiltinTheme } from 'shiki'
import type { Component } from 'vue'

export type Monaco = Awaited<ReturnType<typeof loader.init>>
export type Editor = Awaited<ReturnType<Monaco['editor']['create']>>

export interface UserConfig {
  locale: string
  staticMode: boolean
  autoScroll: boolean
  typedStep: number
  typedDelay: number
  showInputEditor: boolean
  showAstResult: boolean
  shikiLightTheme: BuiltinTheme
  shikiDarkTheme: BuiltinTheme
  mermaidLightTheme: string
  mermaidDarkTheme: string
}

export interface IconButtonProps {
  icon: Component
  name?: string
  buttonClass?: string | string[]
  iconClass?: string | string[]
  variant?: 'default' | 'toggle'
  placement?: 'top' | 'bottom'
  defaultActive?: boolean
}

export interface Action extends IconButtonProps {
  key: string
  onClick: (e: MouseEvent) => void
  visible?: () => boolean
}
