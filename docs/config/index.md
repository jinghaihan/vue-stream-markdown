# Configuration Overview

## Configuration

StreamMarkdown provides comprehensive configuration options to customize the markdown rendering experience.

- [Parser](/config/parser) - Configure markdown parsing options including preprocessing and postprocessing.
- [Display Options](/config/display-options) - Configure display settings for code blocks and images.
- [Controls](/config/controls) - Configure interactive controls for tables, code blocks, images, and mermaid diagrams.
- [Previewers](/config/previewers) - Configure preview components for any programming language in code blocks.
- [Security](/config/security) - Configure security options for sanitizing links and images.
- [External Options](/config/external-options) - Configure external libraries including Shiki, Mermaid, and KaTeX.
- [Custom Renderers](/config/node-renderers) - Configure custom node renderers.
- [I18n](/config/i18n) - Configure internationalization settings.

## Options

### mode

- **Type:** `'static' | 'streaming'`
- **Default:** `'streaming'`

Rendering mode. `'static'` renders the entire content at once, while `'streaming'` renders content progressively.

### enableAnimate

- **Type:** `boolean | undefined`
- **Default:** `undefined`

Whether to enable the typewriter animation effect when nodes are rendered. When set to `undefined` (default), the animation is automatically enabled in `'streaming'` mode and disabled in `'static'` mode. When explicitly set to `true` or `false`, it will override the default behavior based on the mode.

### themeElement

- **Type:** `() => HTMLElement | undefined`
- **Default:** `() => document.body`

Function to get the element that contains shadcn CSS variables. The library will read CSS variables (e.g., `--background`, `--foreground`, `--primary`, etc.) from the computed styles of this element.

When using Tailwind v3, the library will automatically adapt based on the CSS variables defined on this element. The function is called reactively, so you can return different elements based on your application's state.

### content

- **Type:** `string`

The markdown content to render.

### nodeRenderers

- **Type:** `NodeRenderers`

Custom node renderers to override default rendering behavior for specific node types.

### preload

- **Type:** `PreloadConfig`

Configuration for preloading node renderers to improve initial rendering performance.

#### nodeRenderers

- **Type:** `BuiltinNodeRenderers[]`

List of node renderer types to preload. If not specified, a default list of lightweight renderers is preloaded. Preloading happens after merging custom renderers, ensuring the preloaded components match your final configuration.

### icons

- **Type:** `Partial<Icons>`

Custom icon components to override default icons. You can provide custom Vue components for any of the available icon names. The available icon names are provided via TypeScript type hints.

### locale

- **Type:** `string | LocaleConfig`

Locale configuration for internationalization. Can be a locale string or a custom locale configuration object.

### mdastOptions

- **Type:** `MdastOptions`

Options for configuring the MDAST (Markdown Abstract Syntax Tree) parser.

#### from

- **Type:** `FromMarkdownExtension[]`

Extensions for parsing markdown to MDAST.

#### to

- **Type:** `ToMarkdownExtension[]`

Extensions for converting MDAST to markdown.

#### micromark

- **Type:** `MicromarkExtension[]`

Micromark extensions for parsing.

#### builtin

- **Type:** `{ micromark?: BuiltinPluginControl, from?: BuiltinPluginControl, to?: BuiltinPluginControl }`

Control built-in plugins. Set a plugin key to `false` to disable it, or provide a function to override it.

#### singleDollarTextMath

- **Type:** `boolean`
- **Default:** `false`

Enable single dollar sign (`$`) for inline math expressions.

### normalize

- **Type:** `(content: string) => string`

Function to normalize the markdown content before parsing.

### preprocess

- **Type:** `(content: string) => string`

Function to preprocess the markdown content before parsing.

### postNormalize

- **Type:** `(data: SyntaxTree) => SyntaxTree`

Function to normalize the syntax tree after parsing but before postprocess. Used for basic AST normalization tasks, such as reorganizing footnote definitions.

### postprocess

- **Type:** `(content: SyntaxTree) => SyntaxTree`

Function to postprocess the syntax tree after postNormalize. In streaming mode, this is always applied; in static mode, it is skipped.

### controls

- **Type:** `boolean | ControlsConfig`

Configuration for interactive controls. Set to `false` to disable all controls, or configure specific control types.

#### table

- **Type:** `boolean | TableControlsConfig`

Controls for tables. Can be a boolean or an object with specific options.

##### copy

- **Type:** `boolean | string`

Enable copy button for tables. Can be a boolean or a custom label string.

##### download

- **Type:** `boolean | string`

Enable download button for tables. Can be a boolean or a custom label string.

#### code

- **Type:** `boolean | CodeControlsConfig`

Controls for code blocks. Can be a boolean or an object with specific options.

##### collapse

- **Type:** `boolean`

Enable collapse/expand functionality for code blocks.

##### copy

- **Type:** `boolean`

Enable copy button for code blocks.

##### download

- **Type:** `boolean`

Enable download button for code blocks.

##### fullscreen

- **Type:** `boolean`

Enable fullscreen mode for code blocks.

##### lineNumbers

- **Type:** `boolean`

Enable line numbers display for code blocks.

#### image

- **Type:** `boolean | ImageControlsConfig`

Controls for images. Can be a boolean or an object with specific options.

##### preview

- **Type:** `boolean`

Enable preview functionality for images. When enabled, users can click on the image to open it in preview mode (zoomed/fullscreen).

##### download

- **Type:** `boolean`

Enable download button for images.

##### carousel

- **Type:** `boolean`

Enable carousel functionality for images. When enabled and there are multiple images in the document, users can navigate between images using previous/next buttons when the image is opened in preview mode.

##### flip

- **Type:** `boolean`

Enable flip functionality for images.

##### rotate

- **Type:** `boolean`

Enable rotate functionality for images.

##### controlPosition

- **Type:** `ZoomControlPosition`

Position of the control buttons for images.

#### mermaid

- **Type:** `boolean | MermaidControlsConfig`

Controls for Mermaid diagrams. Can be a boolean or an object with zoom options.

##### inlineInteractive

- **Type:** `boolean`
- **Default:** `true`

Enable drag/pan interactions in page preview. When set to `false`, drag/pan is disabled in page preview but kept in fullscreen preview. Useful for mobile devices where drag interactions can interfere with page scrolling.

##### position

- **Type:** `ZoomControlPosition`

Position of the zoom control button.

### previewers

- **Type:** `boolean | PreviewerConfig`

Configuration for preview components. Set to `false` to disable all previewers, or configure specific previewer types for any programming language.

The `PreviewerConfig` is an object that can contain:
- `placement?: 'left' | 'center' | 'right' | 'auto'` - Position of the preview component relative to the code block (default: `'auto'`)
- `components?: Record<string, Component>` - Object containing language-specific previewer configurations
  - For `html` and `mermaid`: `boolean` (to enable/disable default previewers) or `Component` (to provide a custom previewer component)
  - For all other languages: `Component` only (no built-in previewers available)

By default, only `html` and `mermaid` have built-in previewers. For other languages, you need to explicitly configure custom previewer components.

### shikiOptions

- **Type:** `ShikiOptions`

Configuration for Shiki syntax highlighting.

#### theme

- **Type:** `[BuiltinTheme, BuiltinTheme]`

Theme pair for light and dark modes.

#### langs

- **Type:** `BundledLanguage[]`

List of languages to preload when creating the Shiki highlighter. Preloading languages can improve performance by avoiding lazy loading delays.

#### langAlias

- **Type:** `Record<string, string>`

Language aliases mapping.

#### codeToTokenOptions

- **Type:** `CodeToTokensOptions<BundledLanguage, BundledTheme>`

Additional options for code to tokens conversion.

### mermaidOptions

- **Type:** `MermaidOptions`

Configuration for Mermaid diagram rendering.

#### theme

- **Type:** `[string, string]`

Theme pair for light and dark modes.

#### config

- **Type:** `MermaidConfig`

Mermaid configuration object.

#### errorComponent

- **Type:** `Component`

Custom component to display when Mermaid rendering fails.

### katexOptions

- **Type:** `KatexOptions`

Configuration for KaTeX math rendering.

#### config

- **Type:** `KatexConfig`

KaTeX configuration object.

#### errorComponent

- **Type:** `Component`

Custom component to display when KaTeX rendering fails.

### cdnOptions

- **Type:** `CdnOptions`

Configuration for loading external libraries (Shiki, Mermaid, KaTeX) from CDN instead of local node_modules.

#### baseUrl

- **Type:** `string`

Base URL for the CDN. When provided, libraries will be loaded from CDN using jsdelivr format.

#### getUrl

- **Type:** `(module: 'shiki' | 'mermaid' | 'katex' | 'katex-css', version: string) => string`

Custom function to generate CDN URLs for each module.

#### shiki

- **Type:** `boolean`
- **Default:** `true`

Whether to load Shiki from CDN. Requires ESM support.

#### mermaid

- **Type:** `'esm' | 'umd' | false`
- **Default:** `true` (same as `'esm'`)

Choose CDN format: `'esm'` (default, auto-fallback to UMD), `'umd'`, or `false` to disable.

#### katex

- **Type:** `'esm' | 'umd' | false`
- **Default:** `true` (same as `'esm'`)

Choose CDN format: `'esm'` (default, auto-fallback to UMD), `'umd'`, or `false` to disable.

### hardenOptions

- **Type:** `HardenOptions`

Configuration for security sanitization of links and images.

#### defaultOrigin

- **Type:** `string`

Default origin for relative URLs.

#### allowedLinkPrefixes

- **Type:** `string[]`

List of allowed URL prefixes for links.

#### allowedImagePrefixes

- **Type:** `string[]`

List of allowed URL prefixes for images.

#### allowedProtocols

- **Type:** `string[]`

List of allowed URL protocols.

#### allowDataImages

- **Type:** `boolean`

Whether to allow data URIs for images.

#### errorComponent

- **Type:** `Component`

Custom component to display when sanitization fails.

### codeOptions

- **Type:** `CodeOptions`

Configuration for code block display options.

#### languageIcon

- **Type:** `boolean`

Whether to display language icons for code blocks.

> **Note:** In language-specific options (within the `language` field), `languageIcon` can also be a Vue `Component` to use a custom icon component for that specific language.

#### languageName

- **Type:** `boolean`

Whether to display language names for code blocks.

#### lineNumbers

- **Type:** `boolean`

Whether to display line numbers for code blocks.

#### maxHeight

- **Type:** `number | string`

Maximum height for code block content. When the code content exceeds this height, the code block will become scrollable. If a number is provided, it will be treated as pixels. If a string is provided, it can be any valid CSS height value (e.g., `'500px'`, `'50vh'`).

#### language

- **Type:** `Record<string, CodeOptions> | undefined`

Language-specific code options. Allows you to override display options for specific programming languages. The keys should match the language identifiers used in code blocks (e.g., `'typescript'`, `'python'`, `'mermaid'`).

> **Note:** In language-specific options, `languageIcon` can be `boolean | Component` to use a custom icon component for that specific language.

### imageOptions

- **Type:** `ImageOptions`

Configuration for image display options.

#### fallback

- **Type:** `string`

Fallback image URL when image fails to load.

#### caption

- **Type:** `boolean`

Whether to display image captions.

#### errorComponent

- **Type:** `Component`

Custom component to display when image loading fails.

### uiOptions

- **Type:** `UIOptions`

Configuration for UI interaction options, particularly for mobile devices.

#### hideTooltip

- **Type:** `boolean | undefined`
- **Default:** `false`

Hide tooltips triggered by hover interactions, while keeping dropdowns triggered by click interactions. Useful for mobile devices where hover interactions don't work well.

### isDark

- **Type:** `boolean`

Whether to use dark theme. This affects the theme selection for Shiki, Mermaid, and other components that support theming.

### beforeDownload

- **Type:** `(event: DownloadEvent) => MaybePromise<boolean>`

Callback invoked before any download operation. Return `true` to proceed, `false` to cancel. Useful for authentication checks or permission verification.

**DownloadEvent Types:**

- `{ type: 'image', url: string }`
- `{ type: 'code' | 'table' | 'mermaid', content: string }`
