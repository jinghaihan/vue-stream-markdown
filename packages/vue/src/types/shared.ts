import type {
  BuiltinUIComponents,
  CodeControlsConfig as CoreCodeControlsConfig,
  CodeOptions as CoreCodeOptions,
  CodeOptionsLanguage as CoreCodeOptionsLanguage,
  Control as CoreControl,
  ControlsConfig as CoreControlsConfig,
  ControlTransformer as CoreControlTransformer,
  HardenOptions as CoreHardenOptions,
  Icons as CoreIcons,
  ImageControlsConfig as CoreImageControlsConfig,
  ImageOptions as CoreImageOptions,
  MermaidControlsConfig as CoreMermaidControlsConfig,
  MermaidOptions as CoreMermaidOptions,
  PreviewerConfig as CorePreviewerConfig,
  ShikiOptions as CoreShikiOptions,
  StreamMarkdownExtensions as CoreStreamMarkdownExtensions,
  TableControlsConfig as CoreTableControlsConfig,
  TableOptions as CoreTableOptions,
  UIComponents as CoreUIComponents,
} from '@stream-markdown/core'
import type { RenderOptions as BeautifulMermaidConfig, ThemeName } from 'beautiful-mermaid'
import type { MermaidConfig } from 'mermaid'
import type { BuiltinTheme, BundledLanguage, BundledTheme, CodeToTokensOptions, RegexEngine } from 'shiki'
import type { Component } from 'vue'
import type { ICONS } from '../components/icons'
import type { ComarkPlugin } from './parser'
import type {
  CodeBlockProps,
  MarkdownControlContext,
} from './renderer'
import type { UIButtonProps } from './ui'

export type {
  BuiltinPreviewers,
  BuiltinUIComponents,
  CSVSeparator,
  DownloadControlConfig,
  DownloadControlOptions,
  LinkOptions,
  PreviewSegmentedPlacement,
  UIOptions,
  ZoomControlPosition,
} from '@stream-markdown/core'

export type UIComponents = CoreUIComponents<Component, BuiltinUIComponents>

export type OptionalIconName = 'flipVertical' | 'rotateRight' | 'arrowRight'

export type IconName = keyof typeof ICONS

export type Icons = CoreIcons<Component, IconName, OptionalIconName>

export type Control = CoreControl<UIButtonProps>

export type ControlTransformer<T = unknown> = CoreControlTransformer<Control, T>

export type TableControlsConfig = CoreTableControlsConfig<ControlTransformer<MarkdownControlContext>>

export type CodeControlsConfig = CoreCodeControlsConfig<ControlTransformer<CodeBlockProps>>

export type ImageControlsConfig = CoreImageControlsConfig<ControlTransformer<MarkdownControlContext>>

export type MermaidControlsConfig = CoreMermaidControlsConfig<ControlTransformer<CodeBlockProps>>

export type ControlsConfig = CoreControlsConfig<
  ControlTransformer<MarkdownControlContext>,
  ControlTransformer<CodeBlockProps>,
  ControlTransformer<MarkdownControlContext>,
  ControlTransformer<CodeBlockProps>
>

export type PreviewerConfig = CorePreviewerConfig<Component>

export type ShikiOptions = CoreShikiOptions<
  BuiltinTheme,
  BundledLanguage,
  CodeToTokensOptions<BundledLanguage, BundledTheme>,
  RegexEngine | Promise<RegexEngine>
>

export type MermaidOptions = CoreMermaidOptions<
  Component,
  MermaidConfig,
  ThemeName,
  BeautifulMermaidConfig
>

export type Extensions = CoreStreamMarkdownExtensions<ComarkPlugin<any, any>, Component>

export type ImageOptions = CoreImageOptions<Component>

export type CodeOptions = CoreCodeOptions<Component>

export type CodeOptionsLanguage = CoreCodeOptionsLanguage<Component>

export type TableOptions = CoreTableOptions

export type HardenOptions = CoreHardenOptions<Component>
