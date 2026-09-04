---
title: Typography
navigation:
  icon: i-lucide-type
description: Beautiful, built-in typography styles for all standard Markdown elements with responsive design.
---

vue-stream-markdown comes with beautiful, built-in typography styles inspired by [Tailwind CSS](https://tailwindcss.com/). All standard Markdown elements are styled out of the box, ensuring your content looks polished without additional configuration.

## Headings

vue-stream-markdown supports all six levels of Markdown headings with responsive sizing and proper spacing:

```markdown
# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6
```

::stream-markdown{example="feature-typography.headings"}
::

Headings automatically include:

- Responsive font sizes that scale appropriately
- Proper font weights (semibold by default)
- Optimal line heights for readability
- Consistent vertical spacing

## Text Formatting

### Bold and Italic

Use standard Markdown syntax for emphasis:

```markdown
**Bold text** or **also bold**
_Italic text_ or _also italic_
**_Bold and italic_**
```

::stream-markdown{example="feature-typography.boldItalic"}
::

### Strikethrough

GitHub Flavored Markdown strikethrough is fully supported:

```markdown
~~Crossed out text~~
```

::stream-markdown{example="feature-typography.strikethrough"}
::

### Inline Code

Inline code is styled with a subtle background and monospace font:

```markdown
Use the `vue-stream-markdown` component in your app.
```

::stream-markdown{example="feature-typography.inlineCode"}
::

Inline code is styled with:

- Monospace font family
- Subtle background color
- Rounded corners
- Appropriate padding

## Links

Links are styled with underlines and appropriate colors:

```markdown
[Visit our website](https://example.com)
```

::stream-markdown{example="feature-typography.links"}
::

Features include:

- Distinct styling for regular links
- Proper hover and focus states
- Accessible color contrast
- Smooth transitions

## Lists

### Unordered Lists

```markdown
- First item
- Second item
  - Nested item
  - Another nested item
- Third item
```

::stream-markdown{example="feature-typography.unorderedList"}
::

### Ordered Lists

```markdown
1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step
```

::stream-markdown{example="feature-typography.orderedList"}
::

Lists include:

- Proper indentation for nested levels
- Consistent spacing between items
- Clear visual hierarchy
- Appropriate markers (bullets/numbers)

## Blockquotes

Blockquotes are styled with a left border and subtle background:

```markdown
> "The development of full artificial intelligence could spell the end of the human race."
> — Stephen Hawking
```

::stream-markdown{example="feature-typography.blockquote"}
::

Features:

- Left accent border
- Subtle background color
- Proper padding and margin
- Italic text styling

## Code Blocks

Code blocks receive syntax highlighting when `@stream-markdown/code` is configured:

````markdown
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```
````

::stream-markdown{example="feature-typography.codeBlock"}
::

See the [Code Blocks](/feature/code-blocks) documentation for detailed configuration options.

## Images

Images are responsive and properly contained:

```markdown
![Alt text](https://placehold.co/600x400)
```

::stream-markdown{example="feature-typography.image"}
::

Features:

- Responsive sizing
- Proper aspect ratio preservation
- Loading states
- Alt text for accessibility

See [Images](/feature/images) for preview, carousel, download, caption, and fallback options.

## Tables

Tables are fully styled with borders and hover states:

```markdown
| Feature   | Supported |
| --------- | --------- |
| Markdown  | ✓         |
| Streaming | ✓         |
| Math      | ✓         |
```

::stream-markdown{example="feature-typography.table"}
::

See the [GitHub Flavored Markdown](/feature/gfm) documentation for more table features.

## Horizontal Rules

Create visual separators:

```markdown
---
```

::stream-markdown{example="feature-typography.horizontalRule"}
::

## Paragraphs

Paragraphs receive proper spacing and line height for optimal readability:

```markdown
This is a paragraph with normal text flow. It automatically wraps and includes proper spacing between adjacent paragraphs.

This is a second paragraph with appropriate margin top spacing.
```

::stream-markdown{example="feature-typography.paragraphs"}
::

Paragraphs include:

- Proper spacing between adjacent paragraphs
- Optimal line height for readability
- Automatic text wrapping
- Consistent vertical rhythm

## Interactive Features

Typography elements work seamlessly with interactive controls. To configure these controls, see the [Controls](/config/controls) documentation.
