# Usage

This guide covers installation instructions, basic usage examples, and provides an overview of all available configuration options. For detailed configuration documentation, see the quick links section below.

## Installation

```sh
pnpm add vue-stream-markdown
```

### Peer Dependencies

Since some users may not need complex rendering features like code blocks, Mermaid diagrams, or mathematical formulas, `shiki`, `mermaid`, and `katex` are provided as peer dependencies. If you need these rendering features, please install them manually:

```sh
# For code syntax highlighting
pnpm add shiki

# For Mermaid diagram rendering
pnpm add mermaid

# For LaTeX math rendering
pnpm add katex
```

> **Note:** If you enable CDN configuration, you don't need to install locally as they will be loaded from CDN.

## Basic Usage

By default, the component runs in `streaming` mode, which is optimized for progressive content updates. You can also use `static` mode for complete markdown content:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Markdown } from 'vue-stream-markdown'
// If CDN is enabled, you don't need to manually import katex.min.css
import 'katex/dist/katex.min.css'
import 'vue-stream-markdown/index.css'
// If you don't have shadcn CSS variables globally, import the theme
import 'vue-stream-markdown/theme.css'

const content = ref('# Hello World\n\nThis is a markdown content.')
</script>

<template>
  <!-- Streaming mode (default) -->
  <Markdown :content="content" mode="streaming" />

  <!-- Static mode -->
  <Markdown :content="content" mode="static" />
</template>
```

## Server-Side Rendering (SSR)

This component library supports server-side rendering. When using with Nuxt.js, you need to add the CSS imports in your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  css: [
    // If CDN is enabled, you can omit katex.min.css
    'katex/dist/katex.min.css',
    'vue-stream-markdown/index.css',
    // If you don't have shadcn CSS variables globally, import the theme
    'vue-stream-markdown/theme.css',
  ],
})
```

## Configuration

### Core Props

- `content` (string): The markdown content to render
- `mode` ('streaming' | 'static'): Rendering mode, defaults to `'streaming'`
- `enableAnimate` (boolean | undefined): Enable typewriter animation effect. When `undefined`, automatically enabled in `'streaming'` mode and disabled in `'static'` mode
- `isDark` (boolean): Enable dark mode
- `locale` (string | LocaleConfig): Locale for internationalization, defaults to `'en-US'`
- `preload` (PreloadConfig): Configure which node renderers to preload for better initial rendering performance
- `beforeDownload` ((event: DownloadEvent) => MaybePromise`<boolean>`): Callback invoked before download. Return `true` to proceed, `false` to cancel.

### Code Highlighting

- `shikiOptions` (ShikiOptions): Configuration for Shiki code highlighting

### Mermaid Diagrams

- `mermaidOptions` (MermaidOptions): Configuration for Mermaid diagram rendering

### LaTeX Math

- `katexOptions` (KatexOptions): Configuration for KaTeX math rendering

### CDN Configuration

- `cdnOptions` (CdnOptions): Configure CDN loading for external libraries (Shiki, Mermaid, KaTeX) to reduce bundle size. See [External Options](/config/external-options#cdn-configuration) for detailed documentation.

### Controls

- `controls` (boolean | ControlsConfig): Enable or configure interactive controls (copy, download, etc.)

### Previewers

- `previewers` (boolean | PreviewerConfig): Enable or configure previewers for any programming language. By default, HTML and Mermaid have built-in previewers. You can add custom previewers for any language.

## Quick Links

For detailed configuration options, see the corresponding sections in the [Config](/config/) documentation:

- [Parser Options](/config/parser) - Customize markdown parsing behavior (affects how markdown is parsed and transformed)
- [Display Options](/config/display-options) - Configure display settings (affects Shiki, Mermaid, KaTeX, images, and code blocks)
- [Controls](/config/controls) - Detailed control configuration (affects interactive buttons like copy, download, etc.)
- [Previewers](/config/previewers) - Configure previewer components for any programming language (affects code block preview rendering)
- [Security](/config/security) - Security and hardening options (affects URL validation and protocol blocking)
- [Custom Renderers](/config/node-renderers) - Replace default renderers with custom components (affects how each AST node type is rendered)
- [Internationalization](/config/i18n) - Locale and translation configuration (affects all text content in the component)
