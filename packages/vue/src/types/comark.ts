import type { ElementNode, Node } from '@markmend/parser'
import type { Component } from 'vue'

export interface MarkdownComponentProps {
  loading: boolean
  node: ElementNode
  nodeKey: string
}

export type MarkdownComponents = Record<string, Component>

export type { ElementNode as MarkdownElement, Node as MarkdownNode }
