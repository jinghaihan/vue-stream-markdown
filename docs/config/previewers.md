<script setup>
const htmlExample = `
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Preview Example</title>
  <style>
    html,
    body {
      height: 100%;
      margin: 0;
      padding: 0;
    }
    .container {
      height: 100%;
      box-sizing: border-box;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }
    .button {
      padding: 10px 20px;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }
  <\/style>
<\/head>
<body>
  <div class="container">
    <h2>Hello, World!</h2>
    <p>This is an HTML preview example.</p>
    <button class="button" onclick="alert('Clicked!')">
      Click Me
    </button>
  </div>
<\/body>
<\/html>
\`\`\`
`

const mermaidExample = `
\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\`
`

// Previewers examples
const disableAllPreviewers = false

const disableHtmlPreviewer = {
  html: false,
  mermaid: true,
}

const disableMermaidPreviewer = {
  html: true,
  mermaid: false,
}
</script>

# Previewers

The previewers configuration allows you to enable, disable, or customize preview components for specific code block types, including HTML and Mermaid diagrams.

## previewers

- **Type:** `boolean | PreviewerConfig`
- **Default:** `true` (all previewers enabled by default)

Configuration for code block previewers. Set to `false` to disable all previewers, or configure specific previewer types. When configuring specific previewers, you only need to specify the options you want to customize - other previewers will remain enabled by default.

### PreviewerConfig Interface

```typescript
type PreviewerConfig
  = | boolean
    | {
      html?: boolean | Component
      mermaid?: boolean | Component
    }
```

## html

- **Type:** `boolean | Component | undefined`
- **Default:** `true` (HTML previewer enabled)

Controls the HTML previewer for HTML code blocks. When set to `true`, the default HTML previewer is used, which renders HTML content in a sandboxed iframe. When set to `false`, the previewer is disabled and only the code is shown. When set to a Vue component, that component is used as the custom previewer.

The default HTML previewer renders HTML content in a sandboxed iframe with `allow-scripts` and `allow-same-origin` permissions, allowing the HTML to execute JavaScript while maintaining security isolation. The iframe automatically adjusts its height based on the content.

**HTML code block with preview:**

<StreamMarkdown :content="htmlExample" />

**Disable HTML previewer:**

<StreamMarkdown :content="htmlExample" :previewers="disableHtmlPreviewer" />

```vue
<script setup lang="ts">
import type { PreviewerConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const previewers: PreviewerConfig = {
  html: false,
  mermaid: true,
}
</script>

<template>
  <Markdown :content="content" :previewers="previewers" />
</template>
```

**Custom HTML previewer:**

```vue
<script setup lang="ts">
import type { PreviewerConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'
import CustomHtmlPreviewer from './CustomHtmlPreviewer.vue'

const previewers: PreviewerConfig = {
  html: CustomHtmlPreviewer, // Custom component
}
</script>

<template>
  <Markdown :content="content" :previewers="previewers" />
</template>
```

When using a custom component, it will receive the same props as the default HTML previewer component, which includes the code block node data.

## mermaid

- **Type:** `boolean | Component | undefined`
- **Default:** `true` (Mermaid previewer enabled)

Controls the Mermaid previewer for Mermaid code blocks. When set to `true`, the default Mermaid previewer is used, which renders Mermaid diagrams as SVG. When set to `false`, the previewer is disabled and only the code is shown. When set to a Vue component, that component is used as the custom previewer.

The default Mermaid previewer automatically renders Mermaid diagrams with support for:
- Dark mode theming (automatically switches based on `isDark` prop)
- Zoom controls (configurable via `controls.mermaid`)
- Responsive sizing (automatically adjusts height based on diagram dimensions)
- Error handling (displays error component on render failure)

**Mermaid diagram with preview:**

<StreamMarkdown :content="mermaidExample" />

**Disable Mermaid previewer:**

<StreamMarkdown :content="mermaidExample" :previewers="disableMermaidPreviewer" />

```vue
<script setup lang="ts">
import type { PreviewerConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const previewers: PreviewerConfig = {
  html: true,
  mermaid: false,
}
</script>

<template>
  <Markdown :content="content" :previewers="previewers" />
</template>
```

**Custom Mermaid previewer:**

```vue
<script setup lang="ts">
import type { PreviewerConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'
import CustomMermaidPreviewer from './CustomMermaidPreviewer.vue'

const previewers: PreviewerConfig = {
  mermaid: CustomMermaidPreviewer, // Custom component
}
</script>

<template>
  <Markdown :content="content" :previewers="previewers" />
</template>
```

When using a custom component, it will receive the same props as the default Mermaid previewer component, which includes the code block node data, Mermaid options, and dark mode state.

## Disabling All Previewers

To disable all previewers, set `previewers` to `false`:

```vue
<template>
  <Markdown :content="content" :previewers="false" />
</template>
```

When previewers are disabled, code blocks will only display the code content without any preview functionality.
