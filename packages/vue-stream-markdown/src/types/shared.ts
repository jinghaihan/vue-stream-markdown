import type {
  BuiltinNodeRenderers,
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
  KatexOptions as CoreKatexOptions,
  MermaidControlsConfig as CoreMermaidControlsConfig,
  MermaidOptions as CoreMermaidOptions,
  PreloadConfig as CorePreloadConfig,
  PreviewerConfig as CorePreviewerConfig,
  ShikiOptions as CoreShikiOptions,
  TableControlsConfig as CoreTableControlsConfig,
  UIComponents as CoreUIComponents,
} from '@stream-markdown/core'
import type { RenderOptions as BeautifulMermaidConfig, ThemeName } from 'beautiful-mermaid'
import type { KatexOptions as KatexConfig } from 'katex'
import type { MermaidConfig } from 'mermaid'
import type { BuiltinTheme, BundledLanguage, BundledTheme, CodeToTokensOptions } from 'shiki'
import type { Component } from 'vue'
import type { ICONS } from '../components/icons'
import type {
  CodeNodeRendererProps,
  ImageNodeRendererProps,
  NodeRendererProps,
  TableNodeRendererProps,
} from './renderer'
import type { UIButtonProps } from './ui'

export type {
  BuiltinNodeRenderers,
  BuiltinPreviewers,
  BuiltinUIComponents,
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

export type ControlTransformer<T extends NodeRendererProps = NodeRendererProps> = CoreControlTransformer<Control, T>

export type TableControlsConfig = CoreTableControlsConfig<ControlTransformer<TableNodeRendererProps>>

export type CodeControlsConfig = CoreCodeControlsConfig<ControlTransformer<CodeNodeRendererProps>>

export type ImageControlsConfig = CoreImageControlsConfig<ControlTransformer<ImageNodeRendererProps>>

export type MermaidControlsConfig = CoreMermaidControlsConfig<ControlTransformer<CodeNodeRendererProps>>

export type ControlsConfig = CoreControlsConfig<
  ControlTransformer<TableNodeRendererProps>,
  ControlTransformer<CodeNodeRendererProps>,
  ControlTransformer<ImageNodeRendererProps>,
  ControlTransformer<CodeNodeRendererProps>
>

export type PreviewerConfig = CorePreviewerConfig<Component>

export type ShikiOptions = CoreShikiOptions<
  BuiltinTheme,
  BundledLanguage,
  CodeToTokensOptions<BundledLanguage, BundledTheme>
>

export type MermaidOptions = CoreMermaidOptions<
  Component,
  MermaidConfig,
  ThemeName,
  BeautifulMermaidConfig
>

export type KatexOptions = CoreKatexOptions<Component, KatexConfig>

export type ImageOptions = CoreImageOptions<Component>

export type CodeOptions = CoreCodeOptions<Component>

export type CodeOptionsLanguage = CoreCodeOptionsLanguage<Component>

export type HardenOptions = CoreHardenOptions<Component>

export type PreloadConfig = CorePreloadConfig<BuiltinNodeRenderers>
