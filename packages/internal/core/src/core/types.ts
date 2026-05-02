import type { ParsedNode, SyntaxTree } from '@markmend/ast'

export type StreamMarkdownMode = 'static' | 'streaming'

export interface StreamMarkdownProcessed {
  blocks: SyntaxTree[]
  parsedNodes: ParsedNode[]
  processedContent: string
}

export interface CodeBlockModeState {
  mode: 'preview' | 'source'
}
