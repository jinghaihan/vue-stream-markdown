import type { CodeNode } from '@markmend/ast'
import type { PreviewerConfig } from '../types'
import { normalizeCssSize } from '../utils'

export const DEFAULT_HTML_PREVIEW_SANDBOX = 'allow-scripts'
export const DEFAULT_HTML_PREVIEW_HEIGHT = 360
export const HTML_PREVIEW_HEIGHT_MESSAGE_TYPE = 'stream-markdown:html-preview-height'
export const MAX_HTML_PREVIEW_AUTO_HEIGHT = 1000

export type HtmlPreviewMeasurementMode = 'dom' | 'message' | 'fallback'

export function createHtmlPreviewModel(node: CodeNode) {
  return {
    code: node.value.trim(),
  }
}

export function getHtmlPreviewSandboxTokens(sandbox: string): Set<string> {
  return new Set(sandbox.split(/\s+/).filter(Boolean))
}

export function resolveHtmlPreviewSandbox<TComponent = unknown>(
  previewers: PreviewerConfig<TComponent> | undefined,
): string {
  if (typeof previewers === 'object' && typeof previewers.html?.sandbox === 'string')
    return previewers.html.sandbox
  return DEFAULT_HTML_PREVIEW_SANDBOX
}

export function resolveHtmlPreviewAutoHeight<TComponent = unknown>(
  previewers: PreviewerConfig<TComponent> | undefined,
): boolean {
  if (typeof previewers === 'object' && typeof previewers.html?.autoHeight === 'boolean')
    return previewers.html.autoHeight
  return true
}

export function resolveHtmlPreviewHeight<TComponent = unknown>(
  previewers: PreviewerConfig<TComponent> | undefined,
): string {
  if (typeof previewers === 'object') {
    const height = normalizeCssSize(previewers.html?.height)
    if (height)
      return height
  }
  return `${DEFAULT_HTML_PREVIEW_HEIGHT}px`
}

export function resolveHtmlPreviewMaxHeight<TComponent = unknown>(
  previewers: PreviewerConfig<TComponent> | undefined,
): string | undefined {
  if (typeof previewers !== 'object')
    return undefined
  return normalizeCssSize(previewers.html?.maxHeight)
}

export function resolveHtmlPreviewMaxHeightValue<TComponent = unknown>(
  previewers: PreviewerConfig<TComponent> | undefined,
): number | undefined {
  if (typeof previewers !== 'object')
    return undefined

  return getCssPixelSize(previewers.html?.maxHeight)
}

export function resolveHtmlPreviewMeasurementMode(
  sandbox: string,
  autoHeight: boolean,
): HtmlPreviewMeasurementMode {
  if (!autoHeight)
    return 'fallback'

  const tokens = getHtmlPreviewSandboxTokens(sandbox)
  if (tokens.has('allow-same-origin'))
    return 'dom'
  if (tokens.has('allow-scripts'))
    return 'message'
  return 'fallback'
}

export function createHtmlPreviewSrcdoc(code: string): string {
  const script = createHtmlPreviewHeightScript()

  if (/<\/body\s*>/i.test(code))
    return code.replace(/<\/body\s*>/i, `${script}$&`)

  if (/<\/html\s*>/i.test(code))
    return code.replace(/<\/html\s*>/i, `${script}$&`)

  return `${code}\n${script}`
}

export function getHtmlPreviewMessageHeight(
  data: unknown,
  offset: number = 16,
  maxHeight: number = MAX_HTML_PREVIEW_AUTO_HEIGHT,
): number | undefined {
  if (!data || typeof data !== 'object')
    return undefined

  const payload = data as { type?: unknown, height?: unknown }
  if (payload.type !== HTML_PREVIEW_HEIGHT_MESSAGE_TYPE || typeof payload.height !== 'number' || !Number.isFinite(payload.height))
    return undefined

  return clampHtmlPreviewHeight(Math.ceil(payload.height) + offset, maxHeight)
}

export function clampHtmlPreviewHeight(
  height: number,
  maxHeight: number = MAX_HTML_PREVIEW_AUTO_HEIGHT,
): number {
  return Math.min(Math.max(height, 0), maxHeight)
}

function getCssPixelSize(size: number | string | undefined): number | undefined {
  if (typeof size === 'number')
    return size

  if (typeof size !== 'string')
    return undefined

  const match = size.trim().match(/^(\d+(?:\.\d+)?)px$/)
  if (!match)
    return undefined

  return Number(match[1])
}

function createHtmlPreviewHeightScript(): string {
  return `<script>
;(() => {
  const type = '${HTML_PREVIEW_HEIGHT_MESSAGE_TYPE}'
  let frame = 0

  const measure = () => {
    const root = document.documentElement
    const body = document.body
    const rootRect = root ? root.getBoundingClientRect() : { height: 0 }
    const bodyRect = body ? body.getBoundingClientRect() : { height: 0 }

    return Math.max(
      root ? root.scrollHeight : 0,
      body ? body.scrollHeight : 0,
      root ? root.offsetHeight : 0,
      body ? body.offsetHeight : 0,
      rootRect.height,
      bodyRect.height,
    )
  }

  const send = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      parent.postMessage({ type, height: Math.ceil(measure()) }, '*')
    })
  }

  window.addEventListener('load', send)

  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(send).catch(() => {})

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(send)
    observer.observe(document.documentElement)
    if (document.body)
      observer.observe(document.body)
  }

  if ('MutationObserver' in window) {
    const observer = new MutationObserver(send)
    observer.observe(document.documentElement, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    })
  }

  send()
})()
<\/script>`
}
