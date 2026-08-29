import type { ElementNode, Node } from 'comark'
import type { Component } from 'vue'

export interface MarkdownComponentProps {
  node: ElementNode
}

export type MarkdownComponents = Record<string, Component>

export type { ElementNode as MarkdownElement, Node as MarkdownNode }
