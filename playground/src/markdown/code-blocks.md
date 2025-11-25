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

When a code block is streaming in, Streamdown handles the incomplete state gracefully:

```javascript
function example() {
  // Streaming in progress...
```

The unterminated block parser ensures the code block renders properly even without the closing backticks.
