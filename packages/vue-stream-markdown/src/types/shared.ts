import type {
  BuiltinNodeRenderers as SharedBuiltinNodeRenderers,
  BuiltinPreviewers as SharedBuiltinPreviewers,
  BuiltinUIComponents as SharedBuiltinUIComponents,
  CodeControlsConfig as SharedCodeControlsConfig,
  CodeOptions as SharedCodeOptions,
  CodeOptionsLanguage as SharedCodeOptionsLanguage,
  ControlsConfig as SharedControlsConfig,
  ControlTransformer as SharedControlTransformer,
  HardenOptions as SharedHardenOptions,
  Icons as SharedIcons,
  ImageControlsConfig as SharedImageControlsConfig,
  ImageOptions as SharedImageOptions,
  KatexOptions as SharedKatexOptions,
  LinkOptions as SharedLinkOptions,
  MermaidControlsConfig as SharedMermaidControlsConfig,
  MermaidOptions as SharedMermaidOptions,
  PreloadConfig as SharedPreloadConfig,
  PreviewerConfig as SharedPreviewerConfig,
  PreviewSegmentedPlacement as SharedPreviewSegmentedPlacement,
  ShikiOptions as SharedShikiOptions,
  TableControlsConfig as SharedTableControlsConfig,
  UIComponents as SharedUIComponents,
  UIOptions as SharedUIOptions,
  ZoomControlPosition as SharedZoomControlPosition,
} from '@stream-markdown/shared'
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
import type { SelectOption, UIButtonProps } from './ui'

export type BuiltinNodeRenderers = SharedBuiltinNodeRenderers
export type BuiltinPreviewers = SharedBuiltinPreviewers
export type BuiltinUIComponents = SharedBuiltinUIComponents

export type UIComponentName = BuiltinUIComponents

export type UIComponents = SharedUIComponents<Component, BuiltinUIComponents>

export type OptionalIconName = 'flipVertical' | 'rotateRight' | 'arrowRight'

export type IconName = keyof typeof ICONS

export type Icons = SharedIcons<Component, IconName, OptionalIconName>

export interface Control extends UIButtonProps {
  key: string
  visible?: () => boolean
  onClick: (event: MouseEvent, item?: SelectOption) => void
}

export type ControlTransformer<T extends NodeRendererProps = NodeRendererProps>
  = SharedControlTransformer<Control, T>

export type TableControlsConfig = SharedTableControlsConfig<ControlTransformer<TableNodeRendererProps>>

export type CodeControlsConfig = SharedCodeControlsConfig<ControlTransformer<CodeNodeRendererProps>>

export type ImageControlsConfig = SharedImageControlsConfig<ControlTransformer<ImageNodeRendererProps>>

export type MermaidControlsConfig = SharedMermaidControlsConfig<ControlTransformer<CodeNodeRendererProps>>

export type ZoomControlPosition = SharedZoomControlPosition

export type ControlsConfig = SharedControlsConfig<
  ControlTransformer<TableNodeRendererProps>,
  ControlTransformer<CodeNodeRendererProps>,
  ControlTransformer<ImageNodeRendererProps>,
  ControlTransformer<CodeNodeRendererProps>
>

export type PreviewSegmentedPlacement = SharedPreviewSegmentedPlacement

export type PreviewerConfig = SharedPreviewerConfig<Component>

export type ShikiOptions = SharedShikiOptions<
  BuiltinTheme,
  BundledLanguage,
  CodeToTokensOptions<BundledLanguage, BundledTheme>
>

export type MermaidOptions = SharedMermaidOptions<
  Component,
  MermaidConfig,
  ThemeName,
  BeautifulMermaidConfig
>

export type KatexOptions = SharedKatexOptions<Component, KatexConfig>

export type ImageOptions = SharedImageOptions<Component>

export type LinkOptions = SharedLinkOptions

export type CodeOptions = SharedCodeOptions<Component>

export type CodeOptionsLanguage = SharedCodeOptionsLanguage<Component>

export type HardenOptions = SharedHardenOptions<Component>

export type UIOptions = SharedUIOptions

export type PreloadConfig = SharedPreloadConfig<BuiltinNodeRenderers>
