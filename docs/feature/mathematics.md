<script setup>
const inlineMath = `The quadratic formula is $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$ for solving equations.`

const blockMath = `
$$
E = mc^2
$$`

const fractions = `Example: $$\\frac{1}{2}$$, $$\\frac{a + b}{c - d}$$`

const squareRoots = `Example: $$\\sqrt{16} = 4$$, $$\\sqrt[3]{27} = 3$$`

const exponents = `Example: $$a^2 + b^2 = c^2$$, $$x_1, x_2, \\ldots, x_n$$`

const greekLetters = `Common letters: $$\\alpha, \\beta, \\gamma, \\delta, \\epsilon, \\pi, \\sigma, \\phi, \\omega$$`

const summations = `The sum of first $$n$$ natural numbers: $$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$`

const integrals = `Definite integral: $$\\int_{0}^{1} x^2 \\, dx = \\frac{1}{3}$$`

const limits = `Example: $$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$`

const matrices = `
$$
\\begin{bmatrix}
1 & 2 \\\\
3 & 4
\\end{bmatrix}
$$`

const quadraticFormula = `
$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$`

const eulerIdentity = `
$$
e^{i\\pi} + 1 = 0
$$`

const normalDistribution = `
$$
f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}
$$`

const taylorSeries = `
$$
e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots
$$`

const integrationByParts = `
$$
\\int u \\, dv = uv - \\int v \\, du
$$`

const comparisonOperators = `$$x \\leq y$$, $$a \\geq b$$, $$x \\neq 0$$, $$\\pi \\approx 3.14$$, $$a \\equiv b \\pmod{n}$$`

const setNotation = `$$x \\in A$$, $$y \\notin B$$, $$A \\subset B$$, $$A \\cup B$$, $$A \\cap B$$, $$\\emptyset$$`

const logicSymbols = `$$p \\land q$$, $$p \\lor q$$, $$\\neg p$$, $$p \\implies q$$, $$p \\iff q$$, $$\\forall x$$, $$\\exists y$$`

const calculusNotation = `Derivative: $$\\frac{dy}{dx}$$, Partial: $$\\frac{\\partial f}{\\partial x}$$, Gradient: $$\\nabla f$$, Infinity: $$\\infty$$`

const incompleteEquation = `
$$
E = mc^
`

const inlineVsBlock = `This is inline $$E = mc^2$$ math.

$$
E = mc^2
$$

This is block math.`

const currencyVsMath = `This item costs $5 and that one costs $10. (These are currency symbols)

This equation $$x = 5$$ is mathematical notation. (This is math)`

const spacingExample = `Better spacing: $$\\int f(x) \\, dx$$`
</script>

# Mathematics

vue-stream-markdown provides built-in support for rendering mathematical expressions using LaTeX syntax, powered by [KaTeX](https://katex.org/). Write complex equations and formulas that render beautifully alongside your content.

## Syntax

vue-stream-markdown uses double dollar signs (`$$`) to delimit mathematical expressions by default. Single dollar signs (`$`) are disabled by default to avoid conflicts with currency symbols.

You can enable single dollar sign support by setting `singleDollarTextMath: true` in `mdastOptions`:

```vue
<script setup lang="ts">
import { Markdown } from 'vue-stream-markdown'

const mdastOptions = {
  singleDollarTextMath: true,
}
</script>

<template>
  <Markdown :content="content" :mdast-options="mdastOptions" />
</template>
```

When enabled, you can use both `$math$` (inline) and `$$math$$` (inline or block).

### Inline Math

Wrap inline mathematical expressions with `$$`:

```markdown
The quadratic formula is $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$ for solving equations.
```

<StreamMarkdown :content="inlineMath" />

### Block Math

For display-style equations, place `$$` delimiters on separate lines:

```markdown
$$
E = mc^2
$$
```

This renders the equation centered and larger:

<StreamMarkdown :content="blockMath" />

## Common Mathematical Expressions

### Fractions

```markdown
$$\frac{numerator}{denominator}$$
```

<StreamMarkdown :content="fractions" />

### Square Roots

```markdown
$$\sqrt{x}$$ or $$\sqrt[n]{x}$$
```

<StreamMarkdown :content="squareRoots" />

### Exponents and Subscripts

```markdown
$$x^2$$ or $$x_i$$ or $$x_i^2$$
```

<StreamMarkdown :content="exponents" />

### Greek Letters

```markdown
$$\alpha, \beta, \gamma, \delta, \theta, \pi, \sigma, \omega$$
$$\Gamma, \Delta, \Theta, \Pi, \Sigma, \Omega$$
```

<StreamMarkdown :content="greekLetters" />

### Summations

```markdown
$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$
```

<StreamMarkdown :content="summations" />

### Integrals

```markdown
$$\int_{a}^{b} f(x) \, dx$$
```

<StreamMarkdown :content="integrals" />

### Limits

```markdown
$$\lim_{x \to \infty} \frac{1}{x} = 0$$
```

<StreamMarkdown :content="limits" />

### Matrices

```markdown
$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$
```

<StreamMarkdown :content="matrices" />

## Advanced Examples

### The Quadratic Formula

```markdown
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

<StreamMarkdown :content="quadraticFormula" />

### Euler's Identity

```markdown
$$
e^{i\pi} + 1 = 0
$$
```

<StreamMarkdown :content="eulerIdentity" />

### Normal Distribution

```markdown
$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}
$$
```

<StreamMarkdown :content="normalDistribution" />

### Taylor Series

```markdown
$$
e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots
$$
```

<StreamMarkdown :content="taylorSeries" />

### Integration by Parts

```markdown
$$
\int u \, dv = uv - \int v \, du
$$
```

<StreamMarkdown :content="integrationByParts" />

## Special Operators and Symbols

### Comparison Operators

```markdown
$$\leq$$ $$\geq$$ $$\neq$$ $$\approx$$ $$\equiv$$
```

<StreamMarkdown :content="comparisonOperators" />

### Set Notation

```markdown
$$\in$$ $$\notin$$ $$\subset$$ $$\subseteq$$ $$\cup$$ $$\cap$$ $$\emptyset$$
```

<StreamMarkdown :content="setNotation" />

### Logic Symbols

```markdown
$$\land$$ $$\lor$$ $$\neg$$ $$\implies$$ $$\iff$$ $$\forall$$ $$\exists$$
```

<StreamMarkdown :content="logicSymbols" />

### Calculus Notation

```markdown
$$\frac{dy}{dx}$$ $$\frac{\partial f}{\partial x}$$ $$\nabla$$ $$\infty$$
```

<StreamMarkdown :content="calculusNotation" />

## Streaming Considerations

### Incomplete Equations

vue-stream-markdown's unterminated block parser handles incomplete equations gracefully:

```markdown
$$
E = mc^
```

<StreamMarkdown :content="incompleteEquation" />

During streaming, the parser detects the incomplete block-level equation and adds the closing `$$` delimiter, ensuring proper rendering even before the equation is complete.

### Inline vs Block Detection

The parser distinguishes between inline and block math:

- **Inline**: $$E = mc^2$$ (same line)
- **Block**: Separate lines with newlines

```markdown
This is inline $$E = mc^2$$ math.

$$
E = mc^2
$$

This is block math.
```

<StreamMarkdown :content="inlineVsBlock" />

## Accessibility

Mathematical expressions rendered by KaTeX include:

- **MathML** - Machine-readable math representation
- **Title Attributes** - LaTeX source in tooltips
- **Semantic HTML** - Proper structure for screen readers
- **Scalable Typography** - Math scales with text size settings

## Performance

KaTeX is chosen for its performance characteristics:

- **Fast Rendering** - 2-3x faster than MathJax
- **No JavaScript Runtime** - Pure CSS styling (after initial render)
- **Small Bundle** - Minimal impact on page load

## Common Issues

### Escaping Backslashes

In JavaScript/TypeScript strings, backslashes need to be escaped:

```tsx
// ❌ Wrong
const markdown = '$\frac{1}{2}$'

// ✅ Correct
const markdown = '$$\\frac{1}{2}$$'

// ✅ Or use template literals
const markdown = `$$\frac{1}{2}$$`
```

### Currency vs Math

By default, vue-stream-markdown uses `$$` for math to avoid conflicts with currency:

```markdown
This item costs $5 and that one costs $10. (These are currency symbols)

This equation $$x = 5$$ is mathematical notation. (This is math)
```

<StreamMarkdown :content="currencyVsMath" />

### Spacing in Equations

Use `\,` for thin space, `\:` for medium space, `\;` for thick space:

```markdown
$$\int f(x) \, dx$$
```

<StreamMarkdown :content="spacingExample" />

## Resources

- [KaTeX Documentation](https://katex.org/docs/supported.html) - Complete list of supported functions
- [KaTeX Support Table](https://katex.org/docs/support_table.html) - Feature compatibility
- [LaTeX Math Symbols](https://www.overleaf.com/learn/latex/List_of_Greek_letters_and_math_symbols) - Symbol reference
