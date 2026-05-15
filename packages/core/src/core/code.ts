import type { CodeNode } from '@markmend/ast'
import type {
  CodeOptions,
  CodeOptionsLanguage,
  ControlDescriptor,
  DownloadEvent,
  MaybePromise,
  PreviewerConfig,
  PreviewSegmentedPlacement,
  SelectOption,
} from '../types'
import type { CodeBlockModeState } from './types'
import {
  LANGUAGE_ALIAS,
  LANGUAGE_EXTENSIONS,
} from '../constants'
import {
  getConfigValue,
  isCodeOptionEnabled,
  normalizeCssSize,
  resolveCodeOptions,
} from '../utils'

export interface CodeOptionsModel<TComponent = unknown> {
  languageCodeOptions: CodeOptionsLanguage<TComponent>
  showLanguageIcon: boolean
  showLanguageName: boolean
  showLineNumbers: boolean
  showLanguageTitle: boolean
}

export interface CodeBlockModelOptions<TComponent = unknown> {
  node: CodeNode
  codeOptions?: CodeOptions<TComponent>
  previewers?: PreviewerConfig<TComponent>
  controls?: unknown
  hasMermaid?: boolean
  mode: 'preview' | 'source'
  isPreviewComponent?: (component: unknown) => boolean
}

export interface CodeBlockModel<TComponent = unknown> extends CodeOptionsModel<TComponent> {
  language: string
  progressiveRender: boolean
  previewPlacement: PreviewSegmentedPlacement
  previewable: boolean
  inlineInteractive: boolean
  maxHeight?: string
  downloadOptions: SelectOption[]
}

export function resolveCodeLanguage(lang?: string | null): string {
  if (!lang)
    return 'plaintext'
  return LANGUAGE_ALIAS[lang] ?? lang
}

export function createCodeOptionsModel<TComponent = unknown>(
  codeOptions: CodeOptions<TComponent> | undefined,
  language: string,
): CodeOptionsModel<TComponent> {
  const languageCodeOptions = resolveCodeOptions(codeOptions, language)
  const showLanguageIcon = isCodeOptionEnabled(languageCodeOptions.languageIcon)
  const showLanguageName = isCodeOptionEnabled(languageCodeOptions.languageName)
  const showLineNumbers = isCodeOptionEnabled(languageCodeOptions.lineNumbers)

  return {
    languageCodeOptions,
    showLanguageIcon,
    showLanguageName,
    showLineNumbers,
    showLanguageTitle: showLanguageIcon || showLanguageName,
  }
}

export function createCodeBlockModel<TComponent = unknown>(
  options: CodeBlockModelOptions<TComponent>,
): CodeBlockModel<TComponent> {
  const language = resolveCodeLanguage(options.node.lang)
  const codeOptionsModel = createCodeOptionsModel(options.codeOptions, language)
  const progressiveRender = shouldProgressivelyRenderPreview(options.previewers, language)
  const previewable = isCodePreviewable({
    previewers: options.previewers,
    language,
    nodeLoading: !!options.node.loading,
    hasMermaid: !!options.hasMermaid,
    progressiveRender,
    isPreviewComponent: options.isPreviewComponent,
  })

  return {
    ...codeOptionsModel,
    language,
    progressiveRender,
    previewPlacement: resolvePreviewPlacement(options.previewers, codeOptionsModel.showLanguageTitle),
    previewable,
    inlineInteractive: getConfigValue<boolean>(options.controls, 'mermaid.inlineInteractive') ?? true,
    maxHeight: resolveCodeMaxHeight({
      mode: options.mode,
      codeOptions: options.codeOptions,
      language,
    }),
    downloadOptions: getCodeDownloadOptions(language, !!options.hasMermaid),
  }
}

export function shouldProgressivelyRenderPreview<TComponent = unknown>(
  previewers: PreviewerConfig<TComponent> | undefined,
  language: string,
): boolean {
  if (typeof previewers === 'boolean')
    return language === 'mermaid'

  const data = previewers?.progressive?.[language]
  if (typeof data === 'boolean')
    return data
  return language === 'mermaid'
}

export function resolvePreviewPlacement<TComponent = unknown>(
  previewers: PreviewerConfig<TComponent> | undefined,
  showLanguageTitle: boolean,
): PreviewSegmentedPlacement {
  if (typeof previewers === 'boolean'
    || !previewers?.placement
    || previewers.placement === 'auto') {
    return showLanguageTitle ? 'center' : 'left'
  }
  return previewers.placement
}

export interface CodePreviewableOptions<TComponent = unknown> {
  previewers?: PreviewerConfig<TComponent>
  language: string
  nodeLoading?: boolean
  hasMermaid?: boolean
  progressiveRender?: boolean
  isPreviewComponent?: (component: unknown) => boolean
}

export function isCodePreviewable<TComponent = unknown>(
  options: CodePreviewableOptions<TComponent>,
): boolean {
  const previewers = options.previewers
  if (previewers === false)
    return false

  const progressiveRender = options.progressiveRender
    ?? shouldProgressivelyRenderPreview(previewers, options.language)

  if (!progressiveRender && options.nodeLoading)
    return false

  const html = options.language === 'html' && !options.nodeLoading
  const mermaid = options.language === 'mermaid' && !!options.hasMermaid

  if (previewers === true || previewers === undefined) {
    if (options.language === 'html' && html)
      return true
    if (options.language === 'mermaid' && mermaid)
      return true
    return false
  }

  if (typeof previewers === 'object') {
    if (previewers.components?.[options.language] === false)
      return false

    if (options.language === 'html' && html)
      return true
    if (options.language === 'mermaid' && mermaid)
      return true

    const component = previewers.components?.[options.language]
    if (isCustomPreviewComponent(component, options.isPreviewComponent) && (progressiveRender || !options.nodeLoading))
      return true
  }

  return false
}

export function resolveCodePreviewComponent<TComponent = unknown>(
  language: string,
  previewers: PreviewerConfig<TComponent> | undefined,
  builtinPreviewers: Partial<Record<string, TComponent>>,
  isPreviewComponent?: (component: unknown) => boolean,
): TComponent | undefined {
  const previewer = builtinPreviewers[language]
  if (!previewers || typeof previewers === 'boolean')
    return previewer

  const data = previewers.components?.[language]
  if (data === false)
    return previewer

  if (isCustomPreviewComponent(data, isPreviewComponent))
    return data as TComponent

  return previewer
}

export interface CodeMaxHeightOptions<TComponent = unknown> {
  mode: 'preview' | 'source'
  codeOptions?: CodeOptions<TComponent>
  language: string
}

export function resolveCodeMaxHeight<TComponent = unknown>(
  options: CodeMaxHeightOptions<TComponent>,
): string | undefined {
  if (options.mode === 'preview')
    return undefined

  const specific = options.codeOptions?.language?.[options.language]?.maxHeight
  if (specific)
    return normalizeCssSize(specific)

  const height = options.codeOptions?.maxHeight
  if (height)
    return normalizeCssSize(height)

  return undefined
}

export function getCodeDownloadOptions(language: string, hasMermaid: boolean): SelectOption[] {
  if (language !== 'mermaid' || !hasMermaid)
    return []
  return [
    { label: 'SVG', value: 'svg' },
    { label: 'PNG', value: 'png' },
    { label: 'MMD', value: 'code' },
  ]
}

export interface CodeBlockControlDescriptorOptions {
  collapsed: boolean
  fullscreen: boolean
  copied: boolean
  language: string
  showCollapse: boolean
  showCopy: boolean
  showDownload: boolean
  showFullscreen: boolean
  downloadOptions?: SelectOption[]
}

export interface CodeBlockControlState {
  collapsed: boolean
  fullscreen: boolean
}

export interface CodeBlockControlActionOptions {
  key: string
  select?: SelectOption
  state: CodeBlockControlState
  node: CodeNode
  language: string
  beforeDownload?: (event: DownloadEvent) => MaybePromise<boolean>
  copyText?: (content: string) => MaybePromise<void>
  onCopied?: (content: string) => void
  saveFile?: (filename: string, content: string | Blob, mimeType: string) => MaybePromise<void>
  saveMermaid?: (format: 'svg' | 'png', code: string) => MaybePromise<void>
}

export function createCodeBlockControlDescriptors(
  options: CodeBlockControlDescriptorOptions,
): ControlDescriptor[] {
  return [
    {
      key: 'collapse',
      labelKey: 'button.collapse',
      icon: 'collapse',
      iconStyle: {
        transform: options.collapsed ? 'rotate(180deg)' : undefined,
        transition: 'transform var(--default-transition-duration)',
      },
      visible: options.showCollapse,
    },
    {
      key: 'copy',
      labelKey: 'button.copy',
      icon: options.copied ? 'check' : 'copy',
      visible: options.showCopy,
    },
    {
      key: 'download',
      labelKey: 'button.download',
      icon: 'download',
      options: options.downloadOptions?.length ? options.downloadOptions : undefined,
      visible: options.showDownload && !!getCodeFileExtension(options.language),
    },
    {
      key: 'fullscreen',
      labelKey: options.fullscreen ? 'button.minimize' : 'button.maximize',
      icon: options.fullscreen ? 'minimize' : 'maximize',
      visible: options.showFullscreen,
    },
  ]
}

export function getCodeFileExtension(language: string): string | undefined {
  return (LANGUAGE_EXTENSIONS as Record<string, string | undefined>)[language]
}

export function createCodeRendererModel(node: CodeNode) {
  const code = node.value.trim()
  const lang = node.lang || ''

  return {
    code,
    lang,
    languageClass: `language-${node.lang}`,
    lines: code.split('\n'),
  }
}

export function syncCodeBlockMode(state: CodeBlockModeState, previewable: boolean): CodeBlockModeState {
  if (!previewable || state.mode === 'preview')
    return state
  return { mode: 'preview' }
}

export async function handleCodeBlockControlAction(
  options: CodeBlockControlActionOptions,
): Promise<CodeBlockControlState> {
  const state = { ...options.state }

  if (options.key === 'collapse') {
    state.collapsed = !state.collapsed
    return state
  }

  if (options.key === 'fullscreen') {
    state.fullscreen = !state.fullscreen
    return state
  }

  if (options.key === 'copy') {
    if (!options.node.value)
      return state

    await options.copyText?.(options.node.value)
    options.onCopied?.(options.node.value)
    return state
  }

  if (options.key !== 'download' || options.node.loading)
    return state

  const selected = options.select
  if (!selected || selected.value === 'code') {
    await downloadCode(options)
    return state
  }

  if (selected.value === 'svg' || selected.value === 'png')
    await downloadMermaid(options, selected.value)

  return state
}

async function downloadCode(options: CodeBlockControlActionOptions) {
  const extension = getCodeFileExtension(options.language)
  if (!extension)
    return

  const result = await resolveBeforeDownload(options.beforeDownload, {
    type: 'code',
    content: options.node.value,
  })
  if (!result)
    return

  await options.saveFile?.(`file.${extension}`, options.node.value, 'text/plain')
}

async function downloadMermaid(
  options: CodeBlockControlActionOptions,
  format: 'svg' | 'png',
) {
  const result = await resolveBeforeDownload(options.beforeDownload, {
    type: 'mermaid',
    content: options.node.value,
  })
  if (result)
    await options.saveMermaid?.(format, options.node.value)
}

async function resolveBeforeDownload(
  beforeDownload: CodeBlockControlActionOptions['beforeDownload'],
  event: DownloadEvent,
): Promise<boolean> {
  if (!beforeDownload)
    return true
  return await beforeDownload(event)
}

function isCustomPreviewComponent(
  component: unknown,
  isPreviewComponent?: (component: unknown) => boolean,
): boolean {
  if (isPreviewComponent)
    return isPreviewComponent(component)
  return !!component && typeof component !== 'boolean'
}
