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

export { blockquote, boldItalic, codeBlock, headings, horizontalRule, image, inlineCode, links, orderedList, paragraphs, strikethrough, table, unorderedList }
