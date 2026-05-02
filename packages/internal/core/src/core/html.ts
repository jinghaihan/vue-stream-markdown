import type { CodeNode } from '@markmend/ast'

export function createHtmlPreviewModel(node: CodeNode) {
  return {
    code: node.value.trim(),
  }
}
