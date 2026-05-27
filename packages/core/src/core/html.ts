import type { CodeNode } from '@markmend/ast'
import type { PreviewerConfig } from '../types'

export const DEFAULT_HTML_PREVIEW_SANDBOX = 'allow-scripts'

export function createHtmlPreviewModel(node: CodeNode) {
  return {
    code: node.value.trim(),
  }
}

export function resolveHtmlPreviewSandbox<TComponent = unknown>(
  previewers: PreviewerConfig<TComponent> | undefined,
): string {
  if (typeof previewers === 'object' && typeof previewers.html?.sandbox === 'string')
    return previewers.html.sandbox
  return DEFAULT_HTML_PREVIEW_SANDBOX
}
