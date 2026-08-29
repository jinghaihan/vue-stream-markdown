---
title: Controls
navigation:
  icon: i-lucide-sliders-horizontal
description: Configure interactive controls for tables, code blocks, images, and Mermaid diagrams including copy, download, and zoom.
---

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

Download controls accept `true` or `false`, or an object with a custom base filename. The appropriate extension is appended automatically:

```typescript
type DownloadControlConfig = boolean | { filename: string }

const controls: ControlsConfig = {
  code: { download: { filename: 'myScript' } },
  table: {
    csvSeparator: 'auto',
    download: { filename: 'report' },
  },
  mermaid: { download: { filename: 'flowchart' } },
}
```

This produces names such as `myScript.ts`, `report.csv`, and `flowchart.svg`. Boolean values retain the default filenames.

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
      csvSeparator?: ',' | ';' | '\t' | 'auto'
      download?: boolean | string | { filename: string }
      fullscreen?: boolean
      customize?: ControlTransformer<MarkdownControlContext>
    }
```

### copy

- **Type:** `boolean | string | { filename: string } | undefined`
- **Default:** `true`

Enable copy button for tables. When set to `true`, the default label is used. When set to a string, that string is used as the button label.

**Only copy button enabled:**

::stream-markdown{example="config-controls.tableExample" controls-example="config-controls.tableOnlyCopy"}
::

```vue
<script setup lang="ts">
import type { ControlsConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const controls: ControlsConfig = {
  table: {
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

- **Type:** `boolean | string | undefined`
- **Default:** `true`

Enable the table download button. A string keeps the existing custom-label behavior; `{ filename: 'report' }` sets the downloaded file's base name. The selected CSV, TSV, or Markdown extension is appended automatically.

### csvSeparator

- **Type:** `',' | ';' | '\t' | 'auto' | undefined`
- **Default:** `','`

Set the delimiter used when copying or downloading CSV. In `auto` mode, comma-decimal locales use a semicolon and other locales use a comma. TSV and Markdown serialization are unchanged.

**Only download button enabled:**

::stream-markdown{example="config-controls.tableExample" controls-example="config-controls.tableOnlyDownload"}
::

```vue
<script setup lang="ts">
import type { ControlsConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const controls: ControlsConfig = {
  table: {
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

Enable fullscreen mode for tables.

**Only fullscreen button enabled:**

::stream-markdown{example="config-controls.tableExample" controls-example="config-controls.tableOnlyFullscreen"}
::

```vue
<script setup lang="ts">
import type { ControlsConfig } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const controls: ControlsConfig = {
  table: {
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
      download?: boolean | { filename: string }
      fullscreen?: boolean
      customize?: ControlTransformer<CodeBlockProps>
    }
```

### collapse

- **Type:** `boolean | undefined`
- **Default:** `true`

Enable collapse/expand functionality for code blocks. When enabled, users can collapse long code blocks to save space.

**Only collapse button enabled:**

::stream-markdown{example="config-controls.codeExample" controls-example="config-controls.codeOnlyCollapse"}
::

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

::stream-markdown{example="config-controls.codeExample" controls-example="config-controls.codeOnlyCopy"}
::

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

- **Type:** `boolean | { filename: string } | undefined`
- **Default:** `true`

Enable the code download button. Use `{ filename: 'myScript' }` to set a custom base filename; the language extension is appended automatically. Mermaid diagrams use the separate `mermaid.download` filename setting.

**Only download button enabled:**

::stream-markdown{example="config-controls.codeExample" controls-example="config-controls.codeOnlyDownload"}
::

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

::stream-markdown{example="config-controls.codeExample" controls-example="config-controls.codeOnlyFullscreen"}
::

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
      customize?: ControlTransformer<MarkdownControlContext>
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

::stream-markdown{example="config-controls.imageExample" controls-example="config-controls.imageOnlyDownload"}
::

### carousel

- **Type:** `boolean | undefined`
- **Default:** `true`

Enable carousel functionality for images. When enabled and there are multiple images in the document, users can navigate between images using previous/next buttons when the image is opened in preview mode (zoomed/fullscreen). The carousel buttons are only displayed when there are multiple images in the document.

**Only carousel control enabled:**

::stream-markdown{example="config-controls.imageListExample" controls-example="config-controls.imageOnlyCarousel"}
::

### flip

- **Type:** `boolean | undefined`
- **Default:** `true`

Enable flip functionality for images. When enabled, users can flip the image horizontally or vertically. This control is only displayed when the image is opened in preview mode (zoomed/fullscreen).

**Only flip control enabled:**

::stream-markdown{example="config-controls.imageExample" controls-example="config-controls.imageOnlyFlip"}
::

### rotate

- **Type:** `boolean | undefined`
- **Default:** `true`

Enable rotate functionality for images. When enabled, users can rotate the image in 90-degree increments. This control is only displayed when the image is opened in preview mode (zoomed/fullscreen).

**Only rotate control enabled:**

::stream-markdown{example="config-controls.imageExample" controls-example="config-controls.imageOnlyRotate"}
::

### controlPosition

- **Type:** `ZoomControlPosition | undefined`
- **Default:** `'bottom-center'`

Position of the control buttons for images in preview mode. The control buttons include download, carousel, flip, rotate, and zoom controls.

**Image with controls at top-right:**

::stream-markdown{example="config-controls.imageExample" controls-example="config-controls.imageTopRight"}
::

## mermaid

- **Type:** `boolean | MermaidControlsConfig`
- **Default:** `true` (zoom controls enabled)

Controls for Mermaid diagrams. Can be a boolean or an object with download and zoom options.

### Interface

```typescript
type MermaidControlsConfig
  = | boolean
    | {
      download?: boolean | { filename: string }
      position?: ZoomControlPosition
      customize?: ControlTransformer<CodeBlockProps>
    }
```

### download

- **Type:** `boolean | { filename: string } | undefined`
- **Default:** Inherits `code.download`

Configure the Mermaid download button or set a custom base filename. The selected `.svg`, `.png`, or `.mmd` extension is appended automatically. When omitted, the existing `code.download` visibility setting is preserved.

### position

- **Type:** `ZoomControlPosition | undefined`
- **Default:** `'bottom-right'`

Position of the zoom control button for Mermaid diagrams. The zoom controls allow users to zoom in, zoom out, and reset the zoom level of Mermaid diagrams.

**Mermaid with zoom controls at top-left:**

::stream-markdown{example="config-controls.mermaidExample" controls-example="config-controls.mermaidTopLeft"}
::

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

::stream-markdown{example="config-controls.mermaidExample" controls-example="config-controls.mermaidTopRight"}
::

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

::stream-markdown{example="config-controls.mermaidExample" controls-example="config-controls.mermaidBottomLeft"}
::

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
type ControlTransformer<T = unknown>
  = (builtin: Control[], context: T) => Control[]
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

Emitted when a user successfully copies content using the copy button.

**Example:**

```vue
<script setup lang="ts">
import { Markdown } from 'vue-stream-markdown'

function handleCopied(content: string) {
  console.log('Content copied:', content)
}
</script>

<template>
  <Markdown :content="content" @copied="handleCopied" />
</template>
```

### beforeDownload

- **Type:** `(event: DownloadEvent) => MaybePromise<boolean>`
- **Triggered when:** User attempts to download content (images, code blocks, tables, or Mermaid diagrams)

Callback invoked before any download operation. Return `true` to proceed, `false` to cancel. Useful for authentication checks or permission verification.

**DownloadEvent Types:**

- `{ type: 'image', url: string }`
- `{ type: 'code' | 'table' | 'mermaid', content: string }`

**Example:**

```vue
<script setup lang="ts">
import type { DownloadEvent } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

async function handleBeforeDownload(event: DownloadEvent): Promise<boolean> {
  const confirmed = await confirm('Confirm download?')
  return confirmed
}
</script>

<template>
  <Markdown :content="content" :before-download="handleBeforeDownload" />
</template>
```
