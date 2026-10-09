---
title: Custom UI Components
navigation:
  icon: i-lucide-blocks
description: Replace built-in UI components with your own implementations
---

Use `uiComponents` to replace shared controls such as Button, Modal, and Tooltip. Replace content nodes through `components`, using `pre` for code blocks and `table` for tables. See [Components](/config/components).

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
import MyButton from './button.vue'
</script>

<template>
  <Markdown
    :content="content"
    :ui-components="{ Button: MyButton }"
  />
</template>
```

## Available Components

| Component      | Props Type              | Description            |
| -------------- | ----------------------- | ---------------------- |
| Alert          | `UIAlertProps`          | Alert modal component  |
| Button         | `UIButtonProps`         | Button component       |
| Caret          | -                       | Cursor/caret indicator |
| Dropdown       | `UIDropdownProps`       | Dropdown menu          |
| ErrorComponent | `UIErrorComponentProps` | Error display          |
| Icon           | `UIIconProps`           | Icon component         |
| Image          | `UIImageProps`          | Image with zoom        |
| Modal          | `UIModalProps`          | Modal dialog           |
| Segmented      | `UISegmentedProps`      | Segmented control      |
| Spin           | -                       | Loading spinner        |
| Tooltip        | `UITooltipProps`        | Tooltip component      |
| ZoomContainer  | `UIZoomContainerProps`  | Zoom wrapper           |

Use `CodeBlockRenderer` and `TableRenderer` to reuse the complete built-in rendering inside content overrides. `CodeRenderer` renders only the highlighted code body by default.
