---
title: Custom UI Components
description: Replace built-in UI components with your own implementations
---

# Custom UI Components

Replace any built-in UI component with your custom implementation.

## Basic Usage

```vue
<script setup lang="ts">
import type { UIButtonProps } from 'vue-stream-markdown'

const MyButton = defineComponent({
  props: {
    name: String,
    variant: String,
  },
  setup(props: UIButtonProps) {
    // your implementation
  }
})
</script>

<template>
  <Markdown
    :components="{ Button: MyButton }"
    :content="content"
  />
</template>
```

## Available Components

| Component | Props Type | Description |
|-----------|-----------|-------------|
| Alert | `UIAlertProps` | Alert modal component |
| Button | `UIButtonProps` | Button component |
| Caret | - | Cursor/caret indicator |
| CodeBlock | `CodeNodeRendererProps` | Code block wrapper |
| Dropdown | `UIDropdownProps` | Dropdown menu |
| ErrorComponent | `UIErrorComponentProps` | Error display |
| Icon | `UIIconProps` | Icon component |
| Image | `UIImageProps` | Image with zoom |
| Modal | `UIModalProps` | Modal dialog |
| Segmented | `UISegmentedProps` | Segmented control |
| Spin | - | Loading spinner |
| Table | `UITableProps` | Table component |
| Tooltip | `UITooltipProps` | Tooltip component |
| ZoomContainer | `UIZoomContainerProps` | Zoom wrapper |

## Props Types

```ts
import type {
  UIAlertProps,
  UIButtonProps,
  UIDropdownProps,
  UIErrorComponentProps,
  UIIconProps,
  UIImageProps,
  UIModalProps,
  UISegmentedProps,
  UITableProps,
  UITooltipProps,
  UIZoomContainerProps,
} from 'vue-stream-markdown'
```

## Example: Custom Button

```vue
<script setup lang="ts">
import type { UIButtonProps } from 'vue-stream-markdown'

const props = defineProps<UIButtonProps>()
</script>

<template>
  <button
    class="my-btn" :class="[props.variant]"
  >
    {{ props.name }}
  </button>
</template>

<style scoped>
.my-btn {
  padding: 8px 16px;
  border-radius: 4px;
}
.my-btn.icon {
  padding: 8px;
}
</style>
```
