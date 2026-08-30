---
title: Images
navigation:
  icon: i-lucide-images
description: Preview, navigate, download, caption, and recover images rendered from Markdown.
---

Images are responsive by default and retain their aspect ratio inside the Markdown container:

```markdown
![Product preview](https://placehold.co/600x400 "Product preview")
```

::stream-markdown{example="feature-typography.image"}
::

## Preview and download

Click an image to open the built-in preview. The preview supports zooming, rotation, flipping, and download controls. Disable only the interactions your application does not need:

```vue
<script setup lang="ts">
const controls = {
  image: {
    preview: true,
    download: true,
    rotate: false,
    flip: false,
  },
}
</script>

<template>
  <Markdown :content="content" :controls="controls" />
</template>
```

## Image carousel

When a document contains multiple images, the preview can move between them without closing the overlay:

::stream-markdown{example="config-controls.imageListExample" controls-example="config-controls.imageOnlyCarousel"}
::

Set `controls.image.carousel` to `false` to hide previous and next controls.

## Captions

Captions use the Markdown image title or alt text:

::stream-markdown{example="config-display-options.imageWithCaption"}
::

```vue
<Markdown :image-options="{ caption: false }" />
```

## Loading errors and fallbacks

Provide a fallback URL when remote images may be unavailable:

```vue
<Markdown
  :content="content"
  :image-options="{ fallback: 'https://placehold.co/600x400' }"
/>
```

You can also supply `imageOptions.errorComponent` for a custom error state.

## Privacy

Use `imageOptions.referrerPolicy` to control referrer information sent to remote hosts. Use `hardenOptions.allowedImagePrefixes` and `allowDataImages` to restrict which image sources are accepted.

See [Display Options](/config/display-options), [Controls](/config/controls), and [Security](/config/security) for the complete configuration.
