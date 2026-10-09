# Code Blocks

> Beautiful syntax highlighting and interactive code blocks powered by Shiki.

## Basic Usage

Create code blocks using triple backticks with an optional language identifier:

```javascript
function greet(name) {
  return `Hello, ${name}!`
}
```

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

```typescript
interface User {
  id: number
  name: string
  email: string
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}
```

#### Python

```python
def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence up to n terms."""
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

print(fibonacci(10))
```

#### Rust

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}
```

## Inline Code

Inline code uses backticks and receives subtle styling:

Use the `useState` hook to manage state in React.

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

Code blocks work seamlessly with streaming content:

## Streaming Considerations

### Incomplete Code Blocks

When a code block is streaming in, the renderer keeps the incomplete state readable:

```javascript
function example() {
  // Streaming in progress...
```

The unterminated block parser ensures the code block renders properly even without the closing backticks.

## Virtual Scrolling

The playground enables virtual scrolling with a 400px height limit by default. Use **Settings → Code Block** to toggle virtual scrolling, change the height (0 = unlimited), or switch Modern / Classic / Minimal.

Scroll vertically to check line numbers and highlighting, and horizontally near row 1001 to check the long line. Copy, download, and fullscreen retain the complete source. Press Play to check streaming: scrolling up pauses bottom following; returning to the bottom resumes it.

### 2000-line JavaScript

```javascript
<!-- long-javascript -->
```
