---
title: Code Blocks
navigation:
  icon: i-lucide-code-xml
description: Beautiful, interactive code blocks with syntax highlighting powered by Shiki, supporting 200+ programming languages.
---

vue-stream-markdown provides interactive code blocks with readable source rendering by default. Install `@stream-markdown/code` to add syntax highlighting powered by [Shiki](https://shiki.style/).

```sh
pnpm add @stream-markdown/code
```

## Basic Usage

Create code blocks using triple backticks with an optional language identifier:

````markdown
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```
````

With the code extension configured, vue-stream-markdown applies syntax highlighting based on the specified language.

## Supported Languages

[Shiki](https://shiki.style/) supports 200+ programming languages out of the box, including:

- **Web**: JavaScript, TypeScript, HTML, CSS, JSX, TSX, Vue, Svelte
- **Backend**: Python, Java, Go, Rust, C, C++, C#, PHP, Ruby
- **Data**: SQL, JSON, YAML, TOML, XML, GraphQL
- **Shell**: Bash, PowerShell, Zsh
- **Markup**: Markdown, MDX, LaTeX
- **And many more**: Kotlin, Swift, Scala, Haskell, Elixir, Clojure...

### Language Examples

#### TypeScript

::stream-markdown{example="feature-code-blocks.typescript"}
::

#### Python

::stream-markdown{example="feature-code-blocks.python"}
::

#### Rust

::stream-markdown{example="feature-code-blocks.rust"}
::

## Theme Configuration

The code extension uses dual themes for light and dark modes:

```vue
<script setup lang="ts">
import { code } from '@stream-markdown/code'
import { Markdown } from 'vue-stream-markdown'

const extensions = {
  code: code({ theme: ['github-light', 'github-dark'] }),
}
</script>

<template>
  <Markdown :extensions="extensions" />
</template>
```

Refer to the [Shiki themes](https://shiki.style/themes) page for a full list of available themes.

## Display Options

You can control the visibility of code block display elements using the `codeOptions` prop:

```vue
<script setup lang="ts">
import type { CodeOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const codeOptions: CodeOptions = {
  languageIcon: true, // Show language icon (default: true)
  languageName: true, // Show language name (default: true)
  lineNumbers: true, // Show line numbers (default: true)
}
</script>

<template>
  <Markdown :code-options="codeOptions" />
</template>
```

All options default to `true` (visible). Set any option to `false` to hide the corresponding element.

### Fence Metadata

Override line numbering for an individual code fence by adding metadata after its language:

````markdown
```typescript startLine=10
const page = 10
```

```typescript noLineNumbers
const compact = true
```
````

`startLine=N` changes the first displayed line number. `noLineNumbers` hides line numbers for that code block, even when `codeOptions.lineNumbers` is enabled.

### Language-Specific Options

You can configure different display options for specific programming languages using the `language` field:

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
  <Markdown :code-options="codeOptions" />
</template>
```

This allows you to customize the display options per language, which is especially useful for mobile devices with limited width where you might want to hide language indicators to make room for preview/source toggle controls.

#### Custom Language Icons

In language-specific options, you can also provide a custom Vue component as the language icon:

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
  <Markdown :code-options="codeOptions" />
</template>
```

When you provide a `Component` for `languageIcon` in language-specific options, it will be used instead of the default built-in icon for that language. This is useful when you want to use custom icons that better represent your specific use case.

### Language Icons

The built-in language icons use a small default set from [Simple Icons](https://simpleicons.org/). For languages outside this default set, code blocks fall back to the generic code icon. You can provide custom icons through `codeOptions.language`.

## Interactive Features

Code blocks include interactive buttons such as copy, download, fullscreen, and collapse. To configure these controls, see the [Controls](/config/controls) documentation.

## Inline Code

Inline code uses backticks and receives subtle styling:

::stream-markdown{example="feature-code-blocks.inlineCode"}
::

Inline code is styled with:

- Monospace font family
- Subtle background color
- Rounded corners
- Appropriate padding

## Code Block Styling

Code blocks include:

- **Line Numbers** - Optional line numbers for reference
- **Rounded Corners** - Modern, polished appearance
- **Proper Padding** - Comfortable spacing
- **Scrolling** - Horizontal scroll for long lines
- **Responsive Design** - Adapts to container width

## Streaming Considerations

Code blocks work seamlessly with streaming content:

### Incomplete Code Blocks

When a code block is streaming in, vue-stream-markdown handles the incomplete state gracefully:

````markdown
```javascript
function example() {
  // Streaming in progress...
```
````

::stream-markdown{example="feature-code-blocks.incomplete" settled-mode="streaming"}
::

The unterminated block parser ensures the code block renders properly even without the closing backticks.
