# Configuration Overview

## Configuration

StreamMarkdown provides comprehensive configuration options to customize the markdown rendering experience.

- [Parser](/config/parser) - Configure markdown parsing options including preprocessing, postprocessing, and markdown-it extensions.
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

### content

- **Type:** `string`

The markdown content to render.

### nodeRenderers

- **Type:** `NodeRenderers`

Custom node renderers to override default rendering behavior for specific node types.

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

##### position

- **Type:** `ZoomControlPosition`

Position of the zoom control button.

### previewers

- **Type:** `boolean | PreviewerConfig`

Configuration for preview components. Set to `false` to disable all previewers, or configure specific previewer types for any programming language.

The `PreviewerConfig` is a record where keys are language identifiers (e.g., `'html'`, `'mermaid'`, `'javascript'`, etc.) and values are either `boolean` (to enable/disable default previewers) or `Component` (to provide a custom previewer component).

By default, only `html` and `mermaid` have built-in previewers. For other languages, you need to explicitly configure custom previewer components.

#### Examples

- `html: boolean | Component` - Enable/disable HTML previewer or provide a custom component
- `mermaid: boolean | Component` - Enable/disable Mermaid previewer or provide a custom component
- `javascript: Component` - Custom previewer component for JavaScript

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

### isDark

- **Type:** `boolean`

Whether to use dark theme. This affects the theme selection for Shiki, Mermaid, and other components that support theming.
