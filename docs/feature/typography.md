<script setup>
const headings = `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`

const boldItalic = `**Bold text** or __also bold__
*Italic text* or _also italic_
***Bold and italic***`

const strikethrough = `~~Crossed out text~~`

const inlineCode = `Use the \`vue-stream-markdown\` component in your app.`

const links = `[Visit our website](https://example.com)`

const unorderedList = `- First item
- Second item
  - Nested item
  - Another nested item
- Third item`

const orderedList = `1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step`

const blockquote = `> "The development of full artificial intelligence could spell the end of the human race."
> — Stephen Hawking`

const codeBlock = `\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\``

const image = `![Alt text](https://placehold.co/600x400)`

const table = `| Feature | Supported |
|---------|-----------|
| Markdown | ✓ |
| Streaming | ✓ |
| Math | ✓ |`

const horizontalRule = `---`

const paragraphs = `This is a paragraph with normal text flow. It automatically wraps and includes proper spacing between adjacent paragraphs.

This is a second paragraph with appropriate margin top spacing.`
</script>

# Typography

vue-stream-markdown comes with beautiful, built-in typography styles powered by Tailwind CSS. All standard Markdown elements are styled out of the box, ensuring your content looks polished without additional configuration.

## Headings

vue-stream-markdown supports all six levels of Markdown headings with responsive sizing and proper spacing:

````markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
````

<StreamMarkdown :content="headings" />

Headings automatically include:
- Responsive font sizes that scale appropriately
- Proper font weights (semibold by default)
- Optimal line heights for readability
- Consistent vertical spacing

## Text Formatting

### Bold and Italic

Use standard Markdown syntax for emphasis:

````markdown
**Bold text** or __also bold__
*Italic text* or _also italic_
***Bold and italic***
````

<StreamMarkdown :content="boldItalic" />

### Strikethrough

GitHub Flavored Markdown strikethrough is fully supported:

````markdown
~~Crossed out text~~
````

<StreamMarkdown :content="strikethrough" />

### Inline Code

Inline code is styled with a subtle background and monospace font:

````markdown
Use the `vue-stream-markdown` component in your app.
````

<StreamMarkdown :content="inlineCode" />

Inline code is styled with:
- Monospace font family
- Subtle background color
- Rounded corners
- Appropriate padding

## Links

Links are styled with underlines and appropriate colors:

````markdown
[Visit our website](https://example.com)
````

<StreamMarkdown :content="links" />

Features include:
- Distinct styling for regular links
- Proper hover and focus states
- Accessible color contrast
- Smooth transitions

## Lists

### Unordered Lists

````markdown
- First item
- Second item
  - Nested item
  - Another nested item
- Third item
````

<StreamMarkdown :content="unorderedList" />

### Ordered Lists

````markdown
1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step
````

<StreamMarkdown :content="orderedList" />

Lists include:
- Proper indentation for nested levels
- Consistent spacing between items
- Clear visual hierarchy
- Appropriate markers (bullets/numbers)

## Blockquotes

Blockquotes are styled with a left border and subtle background:

````markdown
> "The development of full artificial intelligence could spell the end of the human race."
> — Stephen Hawking
````

<StreamMarkdown :content="blockquote" />

Features:
- Left accent border
- Subtle background color
- Proper padding and margin
- Italic text styling

## Code Blocks

Code blocks receive syntax highlighting via Shiki:

````markdown
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```
````

<StreamMarkdown :content="codeBlock" />

See the [Code Blocks](/feature/code-blocks) documentation for detailed configuration options.

## Images

Images are responsive and properly contained:

````markdown
![Alt text](https://placehold.co/600x400)
````

<StreamMarkdown :content="image" />

Features:
- Responsive sizing
- Proper aspect ratio preservation
- Loading states
- Alt text for accessibility

## Tables

Tables are fully styled with borders and hover states:

````markdown
| Feature | Supported |
|---------|-----------|
| Markdown | ✓ |
| Streaming | ✓ |
| Math | ✓ |
````

<StreamMarkdown :content="table" />

See the [GitHub Flavored Markdown](/feature/gfm) documentation for more table features.

## Horizontal Rules

Create visual separators:

````markdown
---
````

<StreamMarkdown :content="horizontalRule" />

## Paragraphs

Paragraphs receive proper spacing and line height for optimal readability:

````markdown
This is a paragraph with normal text flow. It automatically wraps and includes proper spacing between adjacent paragraphs.

This is a second paragraph with appropriate margin top spacing.
````

<StreamMarkdown :content="paragraphs" />

Paragraphs include:
- Proper spacing between adjacent paragraphs
- Optimal line height for readability
- Automatic text wrapping
- Consistent vertical rhythm

## Interactive Features

Typography elements work seamlessly with interactive controls. To configure these controls, see the [Controls](/config/controls) documentation.
