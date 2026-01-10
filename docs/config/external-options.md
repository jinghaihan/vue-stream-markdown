# External Options

vue-stream-markdown integrates with several external libraries for enhanced functionality. This document covers the configuration options for Shiki (syntax highlighting), Mermaid (diagrams), and KaTeX (mathematics rendering).

## shikiOptions

Configure Shiki syntax highlighting for code blocks. Shiki powers the syntax highlighting engine used by vue-stream-markdown.

### Interface

```typescript
interface ShikiOptions {
  theme?: [BuiltinTheme, BuiltinTheme]
  langs?: BundledLanguage[]
  langAlias?: Record<string, string>
  codeToTokenOptions?: CodeToTokensOptions<BundledLanguage, BundledTheme>
}
```

### theme

- **Type:** `[BuiltinTheme, BuiltinTheme]`
- **Default:** `['github-light', 'github-dark']`

Specifies the theme pair for light and dark modes. The first element is the light theme, and the second is the dark theme. vue-stream-markdown automatically switches between themes based on the `isDark` prop.

**Example:**

```vue
<script setup lang="ts">
import type { ShikiOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const shikiOptions: ShikiOptions = {
  theme: ['vitesse-light', 'vitesse-dark'],
}
</script>

<template>
  <Markdown :content="content" :shiki-options="shikiOptions" />
</template>
```

Refer to the [Shiki Themes](https://shiki.matsu.io/themes) page for a complete list of available themes.

### langs

- **Type:** `BundledLanguage[]`
- **Default:** `[]`

Specifies the list of languages to preload when creating the Shiki highlighter. Languages specified here will be loaded upfront during highlighter initialization, which can improve performance by avoiding lazy loading delays when these languages are first encountered in code blocks.

**Note:** By default, vue-stream-markdown loads languages on-demand as they appear in code blocks. Use this option to preload frequently used languages for better performance, especially if you know in advance which languages will be used in your markdown content.

**Example:**

```vue
<script setup lang="ts">
import type { ShikiOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const shikiOptions: ShikiOptions = {
  langs: ['typescript', 'vue'],
}
</script>

<template>
  <Markdown :content="content" :shiki-options="shikiOptions" />
</template>
```

Refer to the [Shiki Languages](https://shiki.matsu.io/languages) page for a complete list of available languages.

### langAlias

- **Type:** `Record<string, string>`
- **Default:** `{}`

Maps language aliases to their canonical language identifiers. This allows you to use alternative names for languages in code blocks.

**Note:** In most cases, you don't need to configure this option. Shiki already handles the majority of common language aliases (e.g., `ts` → `typescript`, `js` → `javascript`, `py` → `python`). Only configure this if you need to add custom aliases or override existing ones.

**Example:**

```vue
<script setup lang="ts">
import type { ShikiOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const shikiOptions: ShikiOptions = {
  langAlias: {
    'custom-lang': 'typescript',
  },
}
</script>

<template>
  <Markdown :content="content" :shiki-options="shikiOptions" />
</template>
```

### codeToTokenOptions

- **Type:** `CodeToTokensOptions<BundledLanguage, BundledTheme>`
- **Default:** `{}`

Additional options passed to Shiki's `codeToTokens` method. This allows fine-grained control over tokenization and rendering.

**Example:**

```vue
<script setup lang="ts">
import type { ShikiOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const shikiOptions: ShikiOptions = {
  codeToTokenOptions: {
    includeExplanation: false,
    transformers: [],
  },
}
</script>

<template>
  <Markdown :content="content" :shiki-options="shikiOptions" />
</template>
```

See the [Shiki API documentation](https://shiki.matsu.io/api) for available options in `CodeToTokensOptions`.

## mermaidOptions

Configure Mermaid diagram rendering. Mermaid is used to render flowcharts, sequence diagrams, state diagrams, and more.

### Interface

```typescript
interface MermaidOptions {
  theme?: [string, string]
  config?: MermaidConfig
  errorComponent?: Component
}
```

### theme

- **Type:** `[string, string]`
- **Default:** `['neutral', 'dark']`

Specifies the theme pair for light and dark modes. The first element is the light theme, and the second is the dark theme. vue-stream-markdown automatically switches between themes based on the `isDark` prop.

**Example:**

```vue
<script setup lang="ts">
import type { MermaidOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const mermaidOptions: MermaidOptions = {
  theme: ['default', 'dark'],
}
</script>

<template>
  <Markdown :content="content" :mermaid-options="mermaidOptions" />
</template>
```

**Available Themes:**

- `default` - Classic Mermaid theme
- `dark` - Dark mode optimized
- `forest` - Green tones
- `neutral` - Minimal styling (default light)
- `base` - Clean, modern style

### config

- **Type:** `MermaidConfig`
- **Default:** `{}`

Mermaid configuration object that allows you to customize diagram rendering, styling, and behavior. This is passed directly to Mermaid's `initialize` method.

**Example:**

```vue
<script setup lang="ts">
import type { MermaidOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const mermaidOptions: MermaidOptions = {
  theme: ['base', 'dark'],
  config: {
    themeVariables: {
      fontSize: '16px',
      fontFamily: 'Inter, sans-serif',
      primaryColor: '#ff6b6b',
      primaryTextColor: '#fff',
      primaryBorderColor: '#ff6b6b',
      lineColor: '#f5f5f5',
      secondaryColor: '#4ecdc4',
      tertiaryColor: '#45b7d1',
    },
    flowchart: {
      nodeSpacing: 50,
      rankSpacing: 50,
      curve: 'basis',
    },
    sequence: {
      actorMargin: 50,
      boxMargin: 10,
      boxTextMargin: 5,
    },
  },
}
</script>

<template>
  <Markdown :content="content" :mermaid-options="mermaidOptions" />
</template>
```

**Common Configuration Options:**

- `themeVariables` - Customize theme colors and styling
- `flowchart` - Configure flowchart-specific settings
- `sequence` - Configure sequence diagram settings
- `gantt` - Configure Gantt chart settings
- `pie` - Configure pie chart settings
- And more...

See the [Mermaid configuration documentation](https://mermaid.js.org/config/theming.html) for a complete list of configuration options.

### errorComponent

- **Type:** `Component`
- **Default:** Built-in error component

Custom Vue component to display when Mermaid diagram rendering fails. The component receives error information as props.

**Example:**

```vue
<script setup lang="ts">
import type { MermaidOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'
import CustomMermaidError from './CustomMermaidError.vue'

const mermaidOptions: MermaidOptions = {
  errorComponent: CustomMermaidError,
}
</script>

<template>
  <Markdown :content="content" :mermaid-options="mermaidOptions" />
</template>
```

## katexOptions

Configure KaTeX for mathematical expression rendering. KaTeX is used to render LaTeX math syntax in markdown.

### Interface

```typescript
interface KatexOptions {
  config?: KatexConfig
  errorComponent?: Component
}
```

### config

- **Type:** `KatexConfig`
- **Default:** `{}`

KaTeX configuration object that allows you to customize math rendering behavior. This is passed directly to KaTeX's `renderToString` method.

**Example:**

```vue
<script setup lang="ts">
import type { KatexOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const katexOptions: KatexOptions = {
  config: {
    throwOnError: false,
    errorColor: '#cc0000',
    strict: 'warn',
    trust: false,
    macros: {
      '\\RR': '\\mathbb{R}',
      '\\NN': '\\mathbb{N}',
    },
  },
}
</script>

<template>
  <Markdown :content="content" :katex-options="katexOptions" />
</template>
```

**Common Configuration Options:**

- `throwOnError` - Whether to throw on parse errors (default: `true`)
- `errorColor` - Color for error messages (default: `#cc0000`)
- `strict` - Error handling mode: `'warn'`, `'ignore'`, or `'error'` (default: `'warn'`)
- `trust` - Whether to allow HTML tags and URLs (default: `false`)
- `macros` - Custom macro definitions
- `displayMode` - Whether to render in display mode (automatically set by vue-stream-markdown)
- `leqno` - Render equation numbers on the left (default: `false`)
- `fleqn` - Render equations flush left (default: `false`)
- And more...

See the [KaTeX options documentation](https://katex.org/docs/options.html) for a complete list of configuration options.

### errorComponent

- **Type:** `Component`
- **Default:** Built-in error component

Custom Vue component to display when KaTeX rendering fails. The component receives error information as props.

**Example:**

```vue
<script setup lang="ts">
import type { KatexOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'
import CustomMathError from './CustomMathError.vue'

const katexOptions: KatexOptions = {
  errorComponent: CustomMathError,
}
</script>

<template>
  <Markdown :content="content" :katex-options="katexOptions" />
</template>
```

## Complete Example

Here's a complete example showing all three options configured together:

```vue
<script setup lang="ts">
import type { KatexOptions, MermaidOptions, ShikiOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const shikiOptions: ShikiOptions = {
  theme: ['vitesse-light', 'vitesse-dark'],
  langs: ['typescript', 'javascript', 'vue'],
}

const mermaidOptions: MermaidOptions = {
  theme: ['base', 'dark'],
  config: {
    themeVariables: {
      primaryColor: '#3b82f6',
    },
  },
}

const katexOptions: KatexOptions = {
  config: {
    throwOnError: false,
    macros: {
      '\\RR': '\\mathbb{R}',
    },
  },
}
</script>

<template>
  <Markdown
    :content="content"
    :shiki-options="shikiOptions"
    :mermaid-options="mermaidOptions"
    :katex-options="katexOptions"
  />
</template>
```

## Resources

### Shiki

- [Shiki Documentation](https://shiki.matsu.io/) - Official Shiki documentation
- [Shiki Themes](https://shiki.matsu.io/themes) - Complete list of available themes
- [Shiki API Reference](https://shiki.matsu.io/api) - API documentation
- [Shiki GitHub](https://github.com/shikijs/shiki) - Source code and issues

### Mermaid

- [Mermaid Documentation](https://mermaid.js.org/intro/) - Official Mermaid documentation
- [Mermaid Configuration](https://mermaid.js.org/config/theming.html) - Configuration options
- [Mermaid Live Editor](https://mermaid.live/) - Test diagrams online
- [Mermaid Syntax Reference](https://mermaid.js.org/intro/syntax-reference.html) - Complete syntax guide
- [Mermaid GitHub](https://github.com/mermaid-js/mermaid) - Source code and issues

### KaTeX

- [KaTeX Documentation](https://katex.org/docs/) - Official KaTeX documentation
- [KaTeX Options](https://katex.org/docs/options.html) - Configuration options
- [KaTeX Supported Functions](https://katex.org/docs/supported.html) - Complete list of supported functions
- [KaTeX Support Table](https://katex.org/docs/support_table.html) - Feature compatibility
- [KaTeX GitHub](https://github.com/KaTeX/KaTeX) - Source code and issues

## CDN Configuration

Configure CDN loading for external libraries to reduce bundle size and improve loading performance. When CDN is enabled, libraries are loaded from CDN instead of local node_modules.

### Interface

```typescript
interface CdnOptions {
  baseUrl?: string
  getUrl?: (module: 'shiki' | 'mermaid' | 'katex' | 'katex-css', version: string) => string
  shiki?: boolean
  mermaid?: 'esm' | 'umd' | false
  katex?: 'esm' | 'umd' | false
}
```

### baseUrl

- **Type:** `string | undefined`
- **Default:** `undefined`

Base URL for the CDN. When provided, libraries will be loaded using jsdelivr format: `${baseUrl}/module@version/+esm` for ESM modules or `${baseUrl}/module@version/dist/module.min.js` for UMD bundles.

**Example:**

```vue
<script setup lang="ts">
import type { CdnOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const cdnOptions: CdnOptions = {
  baseUrl: 'https://cdn.jsdelivr.net/npm/',
  mermaid: 'umd',
}
</script>

<template>
  <Markdown :content="content" :cdn-options="cdnOptions" />
</template>
```

### getUrl

- **Type:** `(module: 'shiki' | 'mermaid' | 'katex' | 'katex-css', version: string) => string | undefined`
- **Default:** `undefined`

Custom function to generate CDN URLs for each module. This allows you to use custom CDN providers or URL patterns.

**Example:**

```vue
<script setup lang="ts">
import type { CdnOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const cdnOptions: CdnOptions = {
  getUrl: (module, version) => {
    return `https://cdn.example.com/${module}@${version}/index.esm.mjs`
  },
}
</script>

<template>
  <Markdown :content="content" :cdn-options="cdnOptions" />
</template>
```

### shiki

- **Type:** `boolean | undefined`
- **Default:** `true`

Whether to load Shiki from CDN. When set to `false`, Shiki will be loaded from local node_modules. Requires ESM support in the browser.

### mermaid

- **Type:** `'esm' | 'umd' | false | undefined`
- **Default:** `true` (same as `'esm'`)

Choose CDN format for Mermaid. `'esm'` (default) or `undefined`/`true` uses ESM with UMD fallback, `'umd'` forces UMD, `false` disables CDN.

### katex

- **Type:** `'esm' | 'umd' | false | undefined`
- **Default:** `true` (same as `'esm'`)

Choose CDN format for KaTeX. `'esm'` (default) or `undefined`/`true` uses ESM with UMD fallback, `'umd'` forces UMD, `false` disables CDN.

## Notes

- CDN configuration is optional. By default, libraries are loaded from local node_modules.
- When CDN is enabled, you don't need to install them as peer dependencies.
- Require ESM support to load from CDN. The library automatically detects ESM support and falls back to local imports if needed.
