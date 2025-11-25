# Typography

> Explore Streamdown's built-in Tailwind typography styles for beautiful Markdown rendering.

## Headings

Streamdown supports all six levels of Markdown headings with responsive sizing and proper spacing:

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Headings automatically include:
- Responsive font sizes that scale appropriately
- Proper font weights (semibold by default)
- Optimal line heights for readability
- Consistent vertical spacing

## Text Formatting

Use standard Markdown syntax for emphasis:

**Bold text** or __also bold__
*Italic text* or _also italic_
***Bold and italic***

### Strikethrough

GitHub Flavored Markdown strikethrough is fully supported:

~~Crossed out text~~

### Inline Code

Inline code is styled with a subtle background and monospace font:

Use the `Streamdown` component in your app.

## Links

Links are styled with underlines and appropriate colors:

[Visit our website](https://streamdown.ai)

Features include:
- Distinct styling for regular links
- Proper hover and focus states
- Accessible color contrast
- Smooth transitions

## Lists

### Unordered Lists

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered Lists

1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

Lists include:
- Proper indentation for nested levels
- Consistent spacing between items
- Clear visual hierarchy
- Appropriate markers (bullets/numbers)

## Blockquotes

Blockquotes are styled with a left border and subtle background:

> "The development of full artificial intelligence could spell the end of the human race."
> — Stephen Hawking

Features:
- Left accent border
- Subtle background color
- Proper padding and margin
- Italic text styling

## Code Blocks

Code blocks receive syntax highlighting via Shiki:

```javascript
function greet(name) {
  return `Hello, ${name}!`
}
```

## Images

Images are responsive and properly contained:

![Alt text](https://placehold.co/600x400)

Features:
- Responsive sizing
- Proper aspect ratio preservation
- Loading states
- Alt text for accessibility

## Tables

Tables are fully styled with borders and hover states:

| Feature | Supported |
|---------|-----------|
| Markdown | ✓ |
| Streaming | ✓ |
| Math | ✓ |

See the [GitHub Flavored Markdown](/docs/gfm) documentation for more table features.

## Horizontal Rules

Create visual separators:

---

## Paragraphs

Paragraphs receive proper spacing and line height for optimal readability:

This is a paragraph with normal text flow. It automatically wraps and includes proper spacing between adjacent paragraphs.

This is a second paragraph with appropriate margin top spacing.
