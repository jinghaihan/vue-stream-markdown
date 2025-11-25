# Configuration Overview

## Configuration

StreamMarkdown provides comprehensive configuration options to customize the markdown rendering experience.

- [Parser](/config/parser) - Configure markdown parsing options including preprocessing, postprocessing, and markdown-it extensions.
- [Display Options](/config/display-options) - Configure display settings for code blocks and images.
- [Controls](/config/controls) - Configure interactive controls for tables, code blocks, images, and mermaid diagrams.
- [Previewers](/config/previewers) - Configure preview components for HTML and Mermaid diagrams.
- [Security](/config/security) - Configure security options for sanitizing links and images.
- [External Options](/config/external-options) - Configure external libraries including Shiki, Mermaid, and KaTeX.
- [Custom Renderers](/config/node-renderers) - Configure custom node renderers.
- [I18n](/config/i18n) - Configure internationalization settings.

## Options

### mode

- **Type:** `'static' | 'streaming'`
- **Default:** `'streaming'`

Rendering mode. `'static'` renders the entire content at once, while `'streaming'` renders content progressively.

### content

- **Type:** `string`

The markdown content to render.

### nodeRenderers

- **Type:** `NodeRenderers`

Custom node renderers to override default rendering behavior for specific node types.

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

### normalize

- **Type:** `(content: string) => string`

Function to normalize the markdown content before parsing.

### preprocess

- **Type:** `(content: string) => string`

Function to preprocess the markdown content before parsing.

### postprocess

- **Type:** `(content: SyntaxTree) => SyntaxTree`

Function to postprocess the syntax tree after parsing.

### extendMarkdownIt

- **Type:** `(md: MarkdownItAsync) => void`

Function to extend the markdown-it instance with custom plugins or configurations.

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

##### download

- **Type:** `boolean`

Enable download button for images.

#### mermaid

- **Type:** `boolean | ZoomControlsConfig`

Controls for Mermaid diagrams. Can be a boolean or an object with zoom options.

##### position

- **Type:** `'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`

Position of the zoom control button.

### previewers

- **Type:** `boolean | PreviewerConfig`

Configuration for preview components. Set to `false` to disable all previewers, or configure specific previewer types.

#### html

- **Type:** `boolean | Component`

Enable HTML previewer or provide a custom component.

#### mermaid

- **Type:** `boolean | Component`

Enable Mermaid previewer or provide a custom component.

### shikiOptions

- **Type:** `ShikiOptions`

Configuration for Shiki syntax highlighting.

#### theme

- **Type:** `[BuiltinTheme, BuiltinTheme]`

Theme pair for light and dark modes.

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

#### languageName

- **Type:** `boolean`

Whether to display language names for code blocks.

#### lineNumbers

- **Type:** `boolean`

Whether to display line numbers for code blocks.

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

### isDark

- **Type:** `boolean`

Whether to use dark theme. This affects the theme selection for Shiki, Mermaid, and other components that support theming.
