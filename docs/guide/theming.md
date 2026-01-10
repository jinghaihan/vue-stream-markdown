# Theming

Learn how to customize the appearance of vue-stream-markdown components.

vue-stream-markdown is designed to be flexible and customizable, allowing you to adapt its appearance to match your application's design system. This guide covers the various ways you can modify vue-stream-markdown's styles to suit your needs.

## No Atomic CSS Required

**Important**: vue-stream-markdown does not require Tailwind CSS, UnoCSS, or any other atomic CSS framework. All styles are self-contained and scoped strictly within the `.stream-markdown` class, ensuring they won't interfere with your existing styles or require additional dependencies.

## Scoped Styling

All vue-stream-markdown styles are scoped under the `.stream-markdown` class. This means:

- Styles are isolated and won't affect other parts of your application
- You can safely use vue-stream-markdown alongside any CSS framework or methodology

```vue
<template>
  <Markdown :content="content" :is-dark="false" />
</template>
```

This renders as:

```html
<div class="stream-markdown light">
  <!-- markdown content -->
</div>
```

## Targeting Specific Elements

vue-stream-markdown uses semantic `data-stream-markdown` attributes on all rendered elements, allowing you to target specific element types for styling. This provides a clean, maintainable way to customize individual components without relying on complex CSS selectors.

### Available Data Attributes

Each rendered element has a `data-stream-markdown` attribute with a semantic value:

- `heading-1` through `heading-6` - Headings
- `paragraph` - Paragraphs
- `blockquote` - Blockquotes
- `code` - Code blocks
- `inline-code` - Inline code
- `link` - Links
- `image` - Images
- `table` - Tables
- `list-item` - List items
- `math` - Math blocks
- `inline-math` - Inline math
- And many more...

### Customizing with Data Attributes

You can target any element using the `data-stream-markdown` attribute:

```css
.stream-markdown [data-stream-markdown='heading-1'] {
  color: #3b82f6;
  font-weight: 700;
}

.stream-markdown [data-stream-markdown='code'] {
  background-color: #1e293b;
  border-radius: 8px;
}

.stream-markdown [data-stream-markdown='link'] {
  color: #8b5cf6;
}
```

## CSS Variables (Recommended)

vue-stream-markdown components use CSS variables for theming, following the [shadcn/ui](https://ui.shadcn.com/) design system. This is the simplest way to customize colors, borders, and other design tokens across all components.

### Default Theme

The library includes a default theme based on the shadcn/ui `blue` theme using `oklch` color space, with light and dark variants. Import it in your application:

```vue
<script setup lang="ts">
import { Markdown } from 'vue-stream-markdown'
import 'vue-stream-markdown/theme.css'
</script>
```

### Variables Used by vue-stream-markdown

The following CSS variables are actually used in the source code:

```sh
/* Typography */
--font-sans
--font-mono

/* Colors */
--background
--foreground
--primary
--accent
--border
--muted
--muted-foreground
--popover
--popover-foreground

/* Transitions */
--default-transition-duration
--typewriter-transition-duration
```

### Customizing CSS Variables

You can override these variables scoped to `.stream-markdown`. The library automatically applies `.light` or `.dark` classes based on the `isDark` prop, allowing you to customize both themes:

```css
/* Override for all themes */
.stream-markdown {
  --primary: #8b5cf6;
  --border: #e5e7eb;
}

/* Light theme specific */
.stream-markdown.light {
  --background: #ffffff;
  --foreground: #0f172a;
}

/* Dark theme specific */
.stream-markdown.dark {
  --background: #0f172a;
  --foreground: #f8fafc;
}
```

### Tailwind v3 Integration

When using Tailwind v3 with shadcn/ui, you can configure the `themeElement` prop to specify which element the library should read CSS variables from. By default, it reads from `document.body`, but you can customize it to read from any element in your application.

## Best Practices

- **Use CSS Variables for Colors**: Prefer overriding CSS variables over direct element styling for consistency
- **Scope Your Styles**: Always prefix custom styles with `.stream-markdown` to avoid conflicts
- **Use Data Attributes**: Target elements using `data-stream-markdown` attributes for maintainable, semantic styling
- **Respect Theme Variants**: Consider both light and dark themes when customizing
- **Maintain Accessibility**: Ensure your custom styles maintain proper color contrast, focus states, and semantic HTML structure
- **Test During Streaming**: Verify that your custom styles work well with incomplete content during streaming
- **Preserve Animations**: vue-stream-markdown includes built-in animations for smooth streaming. Be careful not to override animation-related classes unless intentional

## Styling Priority

The three styling approaches have the following priority (highest to lowest):

1. **Custom Components** - Complete control over rendering
2. **CSS via data-stream-markdown selectors** - Element-specific styling
3. **CSS Variables** - Global theme tokens
