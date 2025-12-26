<script setup>
const codeExample = `
\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);
\`\`\`
`

const languageIconOnly = {
  languageIcon: true,
  languageName: false,
  lineNumbers: false,
}

const languageNameOnly = {
  languageIcon: false,
  languageName: true,
  lineNumbers: false,
}

const lineNumbersOnly = {
  languageIcon: false,
  languageName: false,
  lineNumbers: true,
}

const allEnabled = {
  languageIcon: true,
  languageName: true,
  lineNumbers: true,
}

const imageWithCaption = `
![Placeholder Image](https://placehold.co/600x400 "Placeholder Image with Caption")
`

const imageWithoutCaption = `
![Placeholder Image](https://placehold.co/600x400 "Placeholder Image without Caption")
`

const imageWithFallback = `
![Broken Image](https://nonexistent-image.com/image.png "This will show fallback")
`
</script>

# Display Options

The display options configuration allows you to customize the visual presentation of various markdown elements, including code blocks, images, and theme settings.

## codeOptions

- **Type:** `CodeOptions | undefined`
- **Default:** `undefined` (all options enabled by default)

Configuration for code block display options, including language indicators and line numbers.

### CodeOptions Interface

```typescript
interface CodeOptions {
  languageIcon?: boolean
  languageName?: boolean
  lineNumbers?: boolean
  maxHeight?: number | string
  /**
   * Language specific code options
   * Allows you to override display options for specific programming languages
   */
  language?: Record<string, CodeOptionsLanguage>
}

interface CodeOptionsLanguage extends Omit<CodeOptions, 'languageIcon'> {
  /**
   * Custom language icon component or boolean
   * When set to a Component, it will be used as the icon for that specific language
   */
  languageIcon?: boolean | Component
}
```

All options default to `true` (visible). Set any option to `false` to hide the corresponding element.

### languageIcon

- **Type:** `boolean | undefined` (global), `boolean | Component | undefined` (language-specific)
- **Default:** `true`

Whether to display language icons for code blocks. Language icons are shown in the code block header to visually indicate the programming language.

In language-specific options (within the `language` field), you can also provide a Vue `Component` to use a custom icon for that specific language.

**Only language icon enabled:**

<StreamMarkdown :content="codeExample" :code-options="languageIconOnly" />

### languageName

- **Type:** `boolean | undefined`
- **Default:** `true`

Whether to display language names for code blocks. Language names are shown as text in the code block header.

**Only language name enabled:**

<StreamMarkdown :content="codeExample" :code-options="languageNameOnly" />

### lineNumbers

- **Type:** `boolean | undefined`
- **Default:** `true`

Whether to display line numbers for code blocks. Line numbers are shown on the left side of the code block.

**Only line numbers enabled:**

<StreamMarkdown :content="codeExample" :code-options="lineNumbersOnly" />

### maxHeight

- **Type:** `number | string | undefined`
- **Default:** `undefined` (no height limit)

Maximum height for code block content. When the code content exceeds this height, the code block will become scrollable. This option only applies when viewing the source code (not in preview mode).

- If a `number` is provided, it will be treated as pixels (e.g., `500` means `500px`)
- If a `string` is provided, it can be any valid CSS height value (e.g., `'500px'`, `'50vh'`, `'10rem'`)

You can set a global `maxHeight` for all code blocks, or override it for specific languages using the `language` option.

```vue
<script setup lang="ts">
import type { CodeOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const codeOptions: CodeOptions = {
  maxHeight: 300, // Default max height for all code blocks
  language: {
    typescript: {
      maxHeight: 500, // TypeScript code blocks can be taller
    },
    json: {
      maxHeight: '20vh', // JSON code blocks use viewport height
    },
  },
}
</script>

<template>
  <Markdown :content="content" :code-options="codeOptions" />
</template>
```

### All Options Enabled (Default)

<StreamMarkdown :content="codeExample" :code-options="allEnabled" />

### language

- **Type:** `Record<string, CodeOptions> | undefined`
- **Default:** `undefined`

Language-specific code options. Allows you to override display options for specific programming languages. The keys should match the language identifiers used in code blocks (e.g., `'typescript'`, `'python'`, `'mermaid'`).

**Example: Configure different options for Mermaid diagrams**

```vue
<script setup lang="ts">
import type { CodeOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const codeOptions: CodeOptions = {
  languageIcon: true,
  languageName: true,
  lineNumbers: true,
  language: {
    mermaid: {
      languageIcon: false,
      languageName: false,
      lineNumbers: true,
    },
  },
}
</script>

<template>
  <Markdown :content="content" :code-options="codeOptions" />
</template>
```

In this example, all code blocks will show language icons, language names, and line numbers by default. However, Mermaid code blocks will only show line numbers, hiding the language icon and name.

**Example: Custom language icon component**

You can provide a custom Vue component as the language icon for specific languages:

```vue
<script setup lang="ts">
import type { CodeOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'
import ChartPie from '~icons/lucide/chart-pie'

const codeOptions: CodeOptions = {
  language: {
    echarts: {
      languageIcon: ChartPie,
    },
  },
}
</script>

<template>
  <Markdown :content="content" :code-options="codeOptions" />
</template>
```

In this example, all code blocks will use the default language icons, but `echarts` code blocks will use the custom `CustomIcon` component instead.

### Usage Example

```vue
<script setup lang="ts">
import type { CodeOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const codeOptions: CodeOptions = {
  languageIcon: true,
  languageName: true,
  lineNumbers: false, // Hide line numbers
  maxHeight: 400, // Set max height to 400px
}
</script>

<template>
  <Markdown :content="content" :code-options="codeOptions" />
</template>
```

## imageOptions

- **Type:** `ImageOptions | undefined`
- **Default:** `undefined` (captions enabled by default, no fallback)

Configuration for image display options, including fallback images, captions, and error handling.

### ImageOptions Interface

```typescript
interface ImageOptions {
  fallback?: string
  caption?: boolean
  errorComponent?: Component
}
```

### caption

- **Type:** `boolean | undefined`
- **Default:** `true`

Whether to display image captions. Image captions are extracted from the image's `title` or `alt` attribute and displayed below the image.

**With caption (default):**

<StreamMarkdown :content="imageWithCaption" />

**Without caption:**

<StreamMarkdown :content="imageWithoutCaption" :image-options="{ caption: false }" />

### fallback

- **Type:** `string | undefined`
- **Default:** `undefined`

Fallback image URL to display when an image fails to load. If provided, the fallback image will be shown automatically when the original image fails to load.

**With fallback:**

<StreamMarkdown :content="imageWithFallback" :image-options="{ fallback: 'https://placehold.co/600x400' }" />

### errorComponent

- **Type:** `Component | undefined`
- **Default:** `undefined` (uses default error component)

A custom Vue component to render when an image fails to load. If not provided, the default error component is used.

```vue
<script setup lang="ts">
import { Markdown } from 'vue-stream-markdown'

const CustomImageError = defineComponent({
  template: '<div class="image-error">Failed to load image</div>',
})

const imageOptions = {
  errorComponent: CustomImageError,
}
</script>

<template>
  <Markdown :content="content" :image-options="imageOptions" />
</template>
```

### Usage Example

```vue
<script setup lang="ts">
import type { ImageOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const imageOptions: ImageOptions = {
  fallback: 'https://placehold.co/600x400',
  caption: true,
}
</script>

<template>
  <Markdown :content="content" :image-options="imageOptions" />
</template>
```

## isDark

- **Type:** `boolean | undefined`
- **Default:** `undefined` (auto-detected or `false`)

Whether to use dark theme. This affects the theme selection for Shiki (syntax highlighting), Mermaid (diagrams), and other components that support theming.

When `isDark` is `undefined`, it will automatically detect dark mode by checking if the `dark` class is present on `document.documentElement`, and will reactively update when the class changes.

### Effects on Components

When `isDark` is set, it affects:

- **Shiki**: Selects the dark theme from the theme pair configured in `shikiOptions.theme`
- **Mermaid**: Selects the dark theme from the theme pair configured in `mermaidOptions.theme`
- **Tooltips**: Adjusts tooltip theme for better visibility

### Usage Example

You can integrate `isDark` with your application's theme system:

```vue
<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { computed } from 'vue'
import { Markdown } from 'vue-stream-markdown'

const isDarkMode = useDark()
const isDark = computed(() => isDarkMode.value)
</script>

<template>
  <Markdown :content="content" :is-dark="isDark" />
</template>
```
