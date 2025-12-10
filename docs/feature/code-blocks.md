<script setup>
const typescript = `
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}
\`\`\`
`

const python = `
\`\`\`python
def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence up to n terms."""
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

print(fibonacci(10))
\`\`\`
`

const rust = `
\`\`\`rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}
\`\`\`
`

const inlineCode = `Use the \`useState\` hook to manage state in React.`

const incomplete = `
\`\`\`javascript
function example() {
  // Streaming in progress...
`
</script>

# Code Blocks

vue-stream-markdown provides beautiful, interactive code blocks with syntax highlighting powered by [Shiki](https://shiki.style/). Every code block includes a copy button and supports a wide range of programming languages.

## Basic Usage

Create code blocks using triple backticks with an optional language identifier:

````markdown
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```
````

vue-stream-markdown will automatically apply syntax highlighting based on the specified language.

## Supported Languages

Shiki supports 200+ programming languages out of the box, including:

- **Web**: JavaScript, TypeScript, HTML, CSS, JSX, TSX, Vue, Svelte
- **Backend**: Python, Java, Go, Rust, C, C++, C#, PHP, Ruby
- **Data**: SQL, JSON, YAML, TOML, XML, GraphQL
- **Shell**: Bash, PowerShell, Zsh
- **Markup**: Markdown, MDX, LaTeX
- **And many more**: Kotlin, Swift, Scala, Haskell, Elixir, Clojure...

### Language Examples

#### TypeScript

<StreamMarkdown :content="typescript" />

#### Python

<StreamMarkdown :content="python" />

#### Rust

<StreamMarkdown :content="rust" />

## Theme Configuration

vue-stream-markdown uses dual themes for light and dark modes. You can customize the themes using the `shikiOptions` prop:

```vue
<script setup lang="ts">
import type { ShikiOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const shikiOptions: ShikiOptions = {
  theme: ['github-light', 'github-dark']
}
</script>

<template>
  <Markdown :shiki-options="shikiOptions" />
</template>
```

Refer to the [Shiki Themes](https://shiki.style/themes) page for a full list of available themes.

## Display Options

You can control the visibility of code block display elements using the `codeOptions` prop:

```vue
<script setup lang="ts">
import type { CodeOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const codeOptions: CodeOptions = {
  languageIcon: true, // Show language icon (default: true)
  languageName: true, // Show language name (default: true)
  lineNumbers: true, // Show line numbers (default: true)
}
</script>

<template>
  <Markdown :code-options="codeOptions" />
</template>
```

All options default to `true` (visible). Set any option to `false` to hide the corresponding element.

### Language-Specific Options

You can configure different display options for specific programming languages using the `language` field:

```vue
<script setup lang="ts">
import type { CodeOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const codeOptions: CodeOptions = {
  languageIcon: true,
  languageName: true,
  lineNumbers: true,
  language: {
    mermaid: {
      languageIcon: false,
      languageName: false,
      lineNumbers: true,
    },
  },
}
</script>

<template>
  <Markdown :code-options="codeOptions" />
</template>
```

This allows you to customize the display options per language, which is especially useful for mobile devices with limited width where you might want to hide language indicators to make room for preview/source toggle controls.

#### Custom Language Icons

In language-specific options, you can also provide a custom Vue component as the language icon:

```vue
<script setup lang="ts">
import type { CodeOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'
import ChartPie from '~icons/lucide/chart-pie'

const codeOptions: CodeOptions = {
  language: {
    echarts: {
      languageIcon: ChartPie,
    },
  },
}
</script>

<template>
  <Markdown :code-options="codeOptions" />
</template>
```

When you provide a `Component` for `languageIcon` in language-specific options, it will be used instead of the default built-in icon for that language. This is useful when you want to use custom icons that better represent your specific use case.

### Language Icons

The language icons displayed in code blocks are provided by [Catppuccin](https://github.com/catppuccin/catppuccin). Special thanks to the Catppuccin team for their beautiful icon collection that enhances the visual experience of code blocks.

## Interactive Features

Code blocks include interactive buttons such as copy, download, fullscreen, and collapse. To configure these controls, see the [Controls](/config/controls) documentation.

## Inline Code

Inline code uses backticks and receives subtle styling:

<StreamMarkdown :content="inlineCode" />

Inline code is styled with:
- Monospace font family
- Subtle background color
- Rounded corners
- Appropriate padding

## Code Block Styling

Code blocks include:
- **Line Numbers** - Optional line numbers for reference
- **Rounded Corners** - Modern, polished appearance
- **Proper Padding** - Comfortable spacing
- **Scrolling** - Horizontal scroll for long lines
- **Responsive Design** - Adapts to container width

## Streaming Considerations

Code blocks work seamlessly with streaming content:

### Incomplete Code Blocks

When a code block is streaming in, vue-stream-markdown handles the incomplete state gracefully:

````markdown
```javascript
function example() {
  // Streaming in progress...
````

<StreamMarkdown :content="incomplete" />

The unterminated block parser ensures the code block renders properly even without the closing backticks.
