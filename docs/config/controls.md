<script setup>
const tableExample = `
| Name | Age | City |
|------|-----|------|
| Alice | 30 | New York |
| Bob | 25 | London |
| Charlie | 35 | Tokyo |
`

const codeExample = `
\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);
\`\`\`
`

const imageExample = `
![Placeholder Image](https://placehold.co/600x400)
`

const imageListExample = `
![Placeholder Image](https://placehold.co/600x400)
![Placeholder Image](https://placehold.co/600x500)
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

// Table controls examples
const tableOnlyCopy = {
  table: {
    copy: true,
    download: false,
  },
}

const tableOnlyDownload = {
  table: {
    copy: false,
    download: true,
  },
}

// Code controls examples
const codeOnlyCollapse = {
  code: {
    collapse: true,
    copy: false,
    download: false,
    fullscreen: false,
  },
}

const codeOnlyCopy = {
  code: {
    collapse: false,
    copy: true,
    download: false,
    fullscreen: false,
  },
}

const codeOnlyDownload = {
  code: {
    collapse: false,
    copy: false,
    download: true,
    fullscreen: false,
  },
}

const codeOnlyFullscreen = {
  code: {
    collapse: false,
    copy: false,
    download: false,
    fullscreen: true,
  },
}

// Image controls examples
const imageOnlyDownload = {
  image: {
    download: true,
    carousel: false,
    flip: false,
    rotate: false,
  },
}

const imageOnlyCarousel = {
  image: {
    download: false,
    carousel: true,
    flip: false,
    rotate: false,
  },
}

const imageOnlyFlip = {
  image: {
    download: false,
    carousel: false,
    flip: true,
    rotate: false,
  },
}

const imageOnlyRotate = {
  image: {
    download: false,
    carousel: false,
    flip: false,
    rotate: true,
  },
}

const imageTopRight = {
  image: {
    controlPosition: 'top-right',
  },
}

// Mermaid controls examples
const mermaidTopLeft = {
  mermaid: {
    position: 'top-left',
  },
}

const mermaidTopRight = {
  mermaid: {
    position: 'top-right',
  },
}

const mermaidBottomLeft = {
  mermaid: {
    position: 'bottom-left',
  },
}
</script>

# Controls

The controls configuration allows you to enable or disable interactive controls for various markdown elements, including tables, code blocks, images, and Mermaid diagrams.

> **Note:** All control types (`table`, `code`, `image`, `mermaid`) support the `customize` option for fully customizing controls. See the [Customizing Controls](#customizing-controls) section for details.

## controls

- **Type:** `boolean | ControlsConfig`
- **Default:** `true` (all controls enabled by default)

Configuration for interactive controls. Set to `false` to disable all controls, or configure specific control types. When configuring specific controls, you only need to specify the options you want to customize - other controls will remain enabled by default.

### Interface

```typescript
type ControlsConfig
  = | boolean
    | {
      table?: boolean | TableControlsConfig
      code?: boolean | CodeControlsConfig
      image?: boolean | ImageControlsConfig
      mermaid?: boolean | MermaidControlsConfig
    }
```

## table

- **Type:** `boolean | TableControlsConfig`
- **Default:** `true` (all table controls enabled)

Controls for tables. Can be a boolean or an object with specific options.

### Interface

```typescript
type TableControlsConfig
  = | boolean
    | {
      copy?: boolean | string
      download?: boolean | string
      customize?: ControlTransformer<TableNodeRendererProps>
    }
```

### copy

- **Type:** `boolean | string | undefined`
- **Default:** `true`

Enable copy button for tables. When set to `true`, the default label is used. When set to a string, that string is used as the button label.

**Only copy button enabled:**

<StreamMarkdown :content="tableExample" :controls="tableOnlyCopy" />

```vue
<script setup lang="ts">
import type { ControlsConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const controls: ControlsConfig = {
  table: {
    copy: true,
    download: false,
  },
}
</script>

<template>
  <Markdown :content="content" :controls="controls" />
</template>
```

### download

- **Type:** `boolean | string | undefined`
- **Default:** `true`

Enable download button for tables. When set to `true`, the default label is used. When set to a string, that string is used as the button label. The download button allows users to download the table as CSV, TSV, or Markdown format.

**Only download button enabled:**

<StreamMarkdown :content="tableExample" :controls="tableOnlyDownload" />

```vue
<script setup lang="ts">
import type { ControlsConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const controls: ControlsConfig = {
  table: {
    copy: false,
    download: true,
  },
}
</script>

<template>
  <Markdown :content="content" :controls="controls" />
</template>
```

## code

- **Type:** `boolean | CodeControlsConfig`
- **Default:** `true` (all code controls enabled)

Controls for code blocks. Can be a boolean or an object with specific options.

### Interface

```typescript
type CodeControlsConfig
  = | boolean
    | {
      collapse?: boolean
      copy?: boolean
      download?: boolean
      fullscreen?: boolean
      customize?: ControlTransformer<CodeNodeRendererProps>
    }
```

### collapse

- **Type:** `boolean | undefined`
- **Default:** `true`

Enable collapse/expand functionality for code blocks. When enabled, users can collapse long code blocks to save space.

**Only collapse button enabled:**

<StreamMarkdown :content="codeExample" :controls="codeOnlyCollapse" />

```vue
<script setup lang="ts">
import type { ControlsConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const controls: ControlsConfig = {
  code: {
    collapse: true,
    copy: false,
    download: false,
    fullscreen: false,
  },
}
</script>

<template>
  <Markdown :content="content" :controls="controls" />
</template>
```

### copy

- **Type:** `boolean | undefined`
- **Default:** `true`

Enable copy button for code blocks. When enabled, users can copy the code content to their clipboard.

**Only copy button enabled:**

<StreamMarkdown :content="codeExample" :controls="codeOnlyCopy" />

```vue
<script setup lang="ts">
import type { ControlsConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const controls: ControlsConfig = {
  code: {
    collapse: false,
    copy: true,
    download: false,
    fullscreen: false,
  },
}
</script>

<template>
  <Markdown :content="content" :controls="controls" />
</template>
```

### download

- **Type:** `boolean | undefined`
- **Default:** `true`

Enable download button for code blocks. When enabled, users can download the code as a file. For Mermaid diagrams, additional options (SVG, PNG) are available.

**Only download button enabled:**

<StreamMarkdown :content="codeExample" :controls="codeOnlyDownload" />

```vue
<script setup lang="ts">
import type { ControlsConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const controls: ControlsConfig = {
  code: {
    collapse: false,
    copy: false,
    download: true,
    fullscreen: false,
  },
}
</script>

<template>
  <Markdown :content="content" :controls="controls" />
</template>
```

### fullscreen

- **Type:** `boolean | undefined`
- **Default:** `true`

Enable fullscreen mode for code blocks. When enabled, users can view code blocks in a fullscreen modal for better readability.

**Only fullscreen button enabled:**

<StreamMarkdown :content="codeExample" :controls="codeOnlyFullscreen" />

```vue
<script setup lang="ts">
import type { ControlsConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const controls: ControlsConfig = {
  code: {
    collapse: false,
    copy: false,
    download: false,
    fullscreen: true,
  },
}
</script>

<template>
  <Markdown :content="content" :controls="controls" />
</template>
```

## image

- **Type:** `boolean | ImageControlsConfig`
- **Default:** `true` (image controls enabled)

Controls for images. Can be a boolean or an object with specific options.

> **Note:** The `preview` control enables clicking on the image to open it in preview mode (zoomed/fullscreen). The `download` control appears when hovering over the image. Other controls (`carousel`, `flip`, `rotate`, and `controlPosition`) are only displayed when the image is opened in preview mode (zoomed/fullscreen).

### Interface

```typescript
type ImageControlsConfig
  = | boolean
    | {
      preview?: boolean
      download?: boolean
      carousel?: boolean
      flip?: boolean
      rotate?: boolean
      controlPosition?: ZoomControlPosition
      customize?: ControlTransformer<ImageNodeRendererProps>
    }
```

### preview

- **Type:** `boolean | undefined`
- **Default:** `true`

Enable preview functionality for images. When enabled, users can click on the image to open it in preview mode.

### download

- **Type:** `boolean | undefined`
- **Default:** `true`

Enable download button for images. When enabled, a download button appears when hovering over the image, allowing users to download the image file. The download button is also displayed when the image is opened in preview mode (zoomed/fullscreen).

**Only download button enabled:**

<StreamMarkdown :content="imageExample" :controls="imageOnlyDownload" />

### carousel

- **Type:** `boolean | undefined`
- **Default:** `true`

Enable carousel functionality for images. When enabled and there are multiple images in the document, users can navigate between images using previous/next buttons when the image is opened in preview mode (zoomed/fullscreen). The carousel buttons are only displayed when there are multiple images in the document.

**Only carousel control enabled:**

<StreamMarkdown :content="imageListExample" :controls="imageOnlyCarousel" />

### flip

- **Type:** `boolean | undefined`
- **Default:** `true`

Enable flip functionality for images. When enabled, users can flip the image horizontally or vertically. This control is only displayed when the image is opened in preview mode (zoomed/fullscreen).

**Only flip control enabled:**

<StreamMarkdown :content="imageExample" :controls="imageOnlyFlip" />

### rotate

- **Type:** `boolean | undefined`
- **Default:** `true`

Enable rotate functionality for images. When enabled, users can rotate the image in 90-degree increments. This control is only displayed when the image is opened in preview mode (zoomed/fullscreen).

**Only rotate control enabled:**

<StreamMarkdown :content="imageExample" :controls="imageOnlyRotate" />

### controlPosition

- **Type:** `ZoomControlPosition | undefined`
- **Default:** `'bottom-center'`

Position of the control buttons for images in preview mode. The control buttons include download, carousel, flip, rotate, and zoom controls.

**Image with controls at top-right:**

<StreamMarkdown :content="imageExample" :controls="imageTopRight" />

## mermaid

- **Type:** `boolean | MermaidControlsConfig`
- **Default:** `true` (zoom controls enabled)

Controls for Mermaid diagrams. Can be a boolean or an object with zoom options.

### Interface

```typescript
type MermaidControlsConfig
  = | boolean
    | {
      position?: ZoomControlPosition
      customize?: ControlTransformer<CodeNodeRendererProps>
    }
```

### position

- **Type:** `ZoomControlPosition | undefined`
- **Default:** `'bottom-right'`

Position of the zoom control button for Mermaid diagrams. The zoom controls allow users to zoom in, zoom out, and reset the zoom level of Mermaid diagrams.

**Mermaid with zoom controls at top-left:**

<StreamMarkdown :content="mermaidExample" :controls="mermaidTopLeft" />

```vue
<script setup lang="ts">
import type { ControlsConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const controls: ControlsConfig = {
  mermaid: {
    position: 'top-left',
  },
}
</script>

<template>
  <Markdown :content="content" :controls="controls" />
</template>
```

**Mermaid with zoom controls at top-right:**

<StreamMarkdown :content="mermaidExample" :controls="mermaidTopRight" />

```vue
<script setup lang="ts">
import type { ControlsConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const controls: ControlsConfig = {
  mermaid: {
    position: 'top-right',
  },
}
</script>

<template>
  <Markdown :content="content" :controls="controls" />
</template>
```

**Mermaid with zoom controls at bottom-left:**

<StreamMarkdown :content="mermaidExample" :controls="mermaidBottomLeft" />

```vue
<script setup lang="ts">
import type { ControlsConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const controls: ControlsConfig = {
  mermaid: {
    position: 'bottom-left',
  },
}
</script>

<template>
  <Markdown :content="content" :controls="controls" />
</template>
```

## Customizing Controls

All control types (`table`, `code`, `image`, `mermaid`) support the `customize` option, which allows you to customize the built-in controls or add your own custom controls. The `customize` function receives the built-in controls array and the component props, and should return an array of controls to display.

### customize

- **Type:** `ControlTransformer<T>`
- **Available for:** `table`, `code`, `image`, `mermaid`

The `customize` function signature:

```typescript
type ControlTransformer<T extends NodeRendererProps = NodeRendererProps>
  = (builtin: Control[], props: T) => Control[]
```

**Example:**

```vue
<script setup lang="ts">
import type { ControlsConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'
import Send from '~icons/lucide/send'

const controls: ControlsConfig = {
  table: {
    customize: (builtin) => {
      return [
        ...builtin,
        {
          icon: Send,
          name: 'send',
          key: 'send',
          onClick: () => {
            console.log('send action')
          },
        },
      ]
    },
  },
  // Same pattern applies to code, image, and mermaid
  code: {
    customize: (builtin) => {
      return builtin.filter(control => control.key !== 'download')
    },
  },
  image: {
    customize: (builtin, props) => {
      return [...builtin]
    },
  },
  mermaid: {
    customize: (builtin) => {
      return [...builtin]
    },
  },
}
</script>

<template>
  <Markdown :content="content" :controls="controls" />
</template>
```

## Disabling All Controls

To disable all controls, set `controls` to `false`:

```vue
<template>
  <Markdown :content="content" :controls="false" />
</template>
```

## Events

The Markdown component emits events that allow you to customize user interactions and provide enhanced user experiences.

### copied

- **Type:** `(content: string) => void`
- **Triggered when:** User copies content from a table or code block

The `copied` event is emitted when a user successfully copies content using the copy button. This event provides the copied content as a parameter, allowing you to implement custom interactions such as displaying custom notifications, tracking analytics, or integrating with other parts of your application.

**Example:**

```vue
<script setup lang="ts">
import { Markdown } from 'vue-stream-markdown'

const content = `
\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

| Name | Age |
|------|-----|
| Alice | 30  |
| Bob   | 25  |
`

function handleCopied(copiedContent: string) {
  // Custom interaction logic
  console.log('Content copied:', copiedContent)

  // Example: Show custom notification
  // toast.success('Content copied to clipboard!')

  // Example: Track analytics
  // analytics.track('content_copied', { length: copiedContent.length })
}
</script>

<template>
  <Markdown :content="content" @copied="handleCopied" />
</template>
```
