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

export { incomplete, inlineCode, python, rust, typescript }
