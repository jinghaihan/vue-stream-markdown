---
title: Custom UI Components
description: Replace built-in UI components with your own implementations
---

# Custom UI Components

Sometimes you want to customize UI elements to maintain consistency with your application's design system. `vue-stream-markdown` provides the ability to replace any built-in UI component with your own implementation, giving you full control over the look and feel of your markdown content.

## Example

Customize the Button component:

```vue
<script setup lang="ts">
import type { UIButtonProps } from 'vue-stream-markdown'

const props = defineProps<UIButtonProps>()
</script>

<template>
  <button>{{ props.name }}</button>
</template>
```

```vue
<script setup lang="ts">
import MyButton from './Button.vue'
</script>

<template>
  <Markdown
    :components="{ Button: MyButton }"
    :content="content"
  />
</template>
```

## Available Components

| Component      | Props Type              | Description            |
| -------------- | ----------------------- | ---------------------- |
| Alert          | `UIAlertProps`          | Alert modal component  |
| Button         | `UIButtonProps`         | Button component       |
| Caret          | -                       | Cursor/caret indicator |
| CodeBlock      | `CodeNodeRendererProps` | Code block wrapper     |
| Dropdown       | `UIDropdownProps`       | Dropdown menu          |
| ErrorComponent | `UIErrorComponentProps` | Error display          |
| Icon           | `UIIconProps`           | Icon component         |
| Image          | `UIImageProps`          | Image with zoom        |
| Modal          | `UIModalProps`          | Modal dialog           |
| Segmented      | `UISegmentedProps`      | Segmented control      |
| Spin           | -                       | Loading spinner        |
| Table          | `UITableProps`          | Table component        |
| Tooltip        | `UITooltipProps`        | Tooltip component      |
| ZoomContainer  | `UIZoomContainerProps`  | Zoom wrapper           |
