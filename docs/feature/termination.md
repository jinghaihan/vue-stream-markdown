<script setup>
const incompleteFootnote = `> "Knowledge is power—but digital knowledge is acceleration."[^1]`
const completeFootnote = `> "Knowledge is power—but digital knowledge is acceleration."[^1]

[^1]: Definition of the quote`

const incompleteLink = `[Click here to visit`
const completeLink = `[Click here](https://example.com)`

const incompleteImage = `![Placeholder](https://placehold.co/600x40`
const completeImage = `![Placeholder](https://placehold.co/600x400)`

const incompleteTable = `| Name | Age | City |
| John | 25 | New`
const completeTable = `| Name | Age | City |
| --- | --- | --- |
| John | 25 | New York |
| Jane | 30 | San Francisco |`

const incompleteInlineMath = `The quadratic formula is $$x =`
const completeInlineMath = `The quadratic formula is $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$`

const syntaxTrimming = `Here is some text with a trailing \`\`\``
</script>

# Enhanced Unterminated Block Parsing

vue-stream-markdown builds upon the powerful unterminated block parsing capabilities from [remend](https://github.com/vercel/streamdown/blob/main/packages/remend/README.md), a library maintained by the streamdown team. While remend handles most of the completion work for basic Markdown syntax (bold, italic, strikethrough, inline code, etc.), vue-stream-markdown implements more **aggressive** optimizations specifically for streaming scenarios.

## Enhanced Features

vue-stream-markdown extends remend's capabilities with enhanced handling for footnotes, links, images, tables, inline math, and syntax trimming. These enhancements provide better visual feedback and prevent broken interactions during streaming.

### Footnotes

vue-stream-markdown removes incomplete footnote references (`[^label]`) that don't have corresponding definitions (`[^label]:`). This prevents broken footnote references from appearing during streaming, especially when the definition hasn't arrived yet.

**Incomplete footnote reference (removed):**
```markdown
> "Knowledge is power—but digital knowledge is acceleration."[^1]
```

<StreamMarkdown mode="streaming" :content="incompleteFootnote" />

**Complete footnote (kept):**
```markdown
> "Knowledge is power—but digital knowledge is acceleration."[^1]

[^1]: Definition of the quote
```

<StreamMarkdown :content="completeFootnote" />

#### How It Works

- **Reference removal**: Removes footnote references (`[^label]`) that don't have a corresponding definition (`[^label]:`) in the entire content
- **Incomplete reference handling**: Also removes incomplete references like `[^1` (missing closing bracket)
- **Code block awareness**: Ignores footnote references inside code blocks (both fenced code blocks and inline code)
- **Definition detection**: Scans the entire content to find all footnote definitions before processing references

### Links

Unlike remend which extracts link text and displays it as plain text, vue-stream-markdown completes the link syntax while intelligently disabling click interactions:

**Incomplete link (loading state):**
```markdown
[Click here to visit
```

<StreamMarkdown mode="streaming" :content="incompleteLink" />

**Complete link:**
```markdown
[Click here](https://example.com)
```

<StreamMarkdown :content="completeLink" />

#### How It Works

- **During streaming**: The link syntax is completed, but the link is rendered with `pointer-events: none` and no underline, preventing broken navigation
- **When complete**: The link becomes fully interactive with an underline, indicating it's ready to be clicked
- **Visual feedback**: Users can see the link structure forming, but can't accidentally click on incomplete links
- **Trailing bracket removal**: Standalone `[` or `![` at the end of content (without any content after) are automatically removed to prevent visual artifacts during streaming

### Images

While remend removes incomplete images entirely, vue-stream-markdown completes the image syntax and adds a loading state:

**Incomplete image (loading state):**
```markdown
![Placeholder](https://placehold.co/600x40
```

<StreamMarkdown mode="streaming" :content="incompleteImage" />

**Complete image:**
```markdown
![Placeholder](https://placehold.co/600x400)
```

<StreamMarkdown :content="completeImage" />

#### How It Works

- **During streaming**: The image syntax is completed and a loading spinner is displayed
- **When complete**: The image loads normally with proper error handling
- **Better UX**: Users see visual feedback that an image is coming, rather than nothing at all

### Tables

vue-stream-markdown proactively completes table syntax and provides a loading state, ensuring smooth rendering even when the table structure is incomplete:

**Incomplete table:**
```markdown
| Name | Age | City |
| John | 25 | New
```

<StreamMarkdown mode="streaming" :content="incompleteTable" />

**Complete table:**
```markdown
| Name | Age | City |
| --- | --- | --- |
| John | 25 | New York |
| Jane | 30 | San Francisco |
```

<StreamMarkdown :content="completeTable" />

#### How It Works

- **Header detection**: Automatically detects table headers and completes them if needed
- **Separator generation**: Generates the separator row (`| --- | --- |`) when a header is detected
- **Column matching**: Ensures the separator matches the number of columns in the header
- **Loading state**: Provides visual feedback during table construction

### Inline Math

remend doesn't handle inline KaTeX with single `$` as they're likely currency symbols. vue-stream-markdown attempts to complete inline math syntax, providing better support for mathematical expressions in streaming content:

**Incomplete inline math (partial rendering):**
```markdown
The quadratic formula is $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a$
```

<StreamMarkdown mode="streaming" :content="incompleteInlineMath" />

**Complete inline math:**
```markdown
The quadratic formula is $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$
```

<StreamMarkdown :content="completeInlineMath" />

#### How It Works

- **Pattern detection**: Detects incomplete `$$...$$` patterns in the last paragraph
- **Block vs inline**: Distinguishes between inline math (`$$...$$` on same line) and block math (`$$` on separate lines)
- **Code block awareness**: Ignores math syntax inside code blocks
- **Smart completion**: Only completes when there's actual content after the opening `$$`

### Syntax Trimming

For syntax characters like `` ` ``, `*`, `_` that often indicate the start of a syntax block, vue-stream-markdown attempts to trim them when they appear at the end of content, reducing visual artifacts during streaming:

**Example:**
```markdown
Here is some text with a trailing ```
```

Result:

<StreamMarkdown mode="streaming" :content="syntaxTrimming" />

#### How It Works

- **Trailing detection**: Identifies incomplete syntax sequences at the end of content
- **Smart removal**: Removes trailing backticks (` `, ``, ```) when they have no content
- **Visual cleanup**: Prevents showing intermediate states like `, ``, or ``` at the end of content
- **Context aware**: Only trims when appropriate, preserving valid syntax

## Streaming Examples

### Footnote Streaming

As content streams in, incomplete footnote references are removed until their definitions appear:

- `Text [^1]` → `Text ` (reference removed if definition doesn't exist)
- `Text [^1` → `Text ` (incomplete reference removed)
- `Text [^1]\n\n[^1]: Definition` → `Text [^1]\n\n[^1]: Definition` (reference kept when definition exists)

### Link Streaming

As content streams in, incomplete links render with loading state (no underline, non-clickable), then become fully interactive when complete:

- `[Click here` → Loading state (non-clickable)
- `[Click here](https://example.com)` → Fully clickable with underline
- `Text [` → `Text ` (standalone bracket removed)
- `Text ![\n` → `Text ` (standalone bracket and trailing newline removed)

### Image Streaming

Incomplete images show a loading spinner, then load normally when complete:

- `![Placeholder](https://placehold.co/600x40` → Loading spinner
- `![Placeholder](https://placehold.co/600x400)` → Image loads normally

### Table Streaming

1. `| Name | Age` → Completes header and adds separator row
2. `| Name | Age |\n| --- | --- |` → Table structure ready
3. `| Name | Age |\n| --- | --- |\n| John | 25` → Table renders with data

### Inline Math Streaming

Incomplete inline math expressions are completed and rendered with partial content visible:

- `The quadratic formula is $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a$` → Completes and renders partially (missing closing `$`)
- `The quadratic formula is $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$` → Renders complete formula

## Acknowledgments

This project is deeply inspired by [streamdown](https://streamdown.ai/) and the [remend](https://github.com/vercel/streamdown/blob/main/packages/remend/README.md) library. Special thanks to the streamdown team for their innovative approach to streaming Markdown rendering and for maintaining remend, which handles the core unterminated block parsing for basic Markdown syntax. The foundation they laid has enabled vue-stream-markdown to focus on implementing more aggressive optimizations for enhanced user experience during streaming.
