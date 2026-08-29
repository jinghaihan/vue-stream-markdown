---
title: Mathematics
navigation:
  icon: i-lucide-sigma
description: Built-in support for rendering mathematical expressions using LaTeX syntax powered by KaTeX.
---

vue-stream-markdown provides built-in support for rendering mathematical expressions using LaTeX syntax, powered by [KaTeX](https://katex.org/). Write complex equations and formulas that render beautifully alongside your content.

## Syntax

vue-stream-markdown uses double dollar signs (`$$`) to delimit mathematical expressions by default. Single dollar signs (`$`) are disabled by default to avoid conflicts with currency symbols.

You can enable single dollar sign completion by setting `singleDollarTextMath: true` in `completion`:

```vue
<script setup lang="ts">
import { Markdown } from 'vue-stream-markdown'

const completion = {
  singleDollarTextMath: true,
}
</script>

<template>
  <Markdown :content="content" :completion="completion" />
</template>
```

When enabled, you can use both `$math$` (inline) and `$$math$$` (inline or block).

### Inline Math

Wrap inline mathematical expressions with `$$`:

```markdown
The quadratic formula is $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$ for solving equations.
```

::stream-markdown{example="feature-mathematics.inlineMath"}
::

### Block Math

For display-style equations, place `$$` delimiters on separate lines:

```markdown
$$
E = mc^2
$$
```

This renders the equation centered and larger:

::stream-markdown{example="feature-mathematics.blockMath"}
::

## Common Mathematical Expressions

### Fractions

```markdown
$$\frac{numerator}{denominator}$$
```

::stream-markdown{example="feature-mathematics.fractions"}
::

### Square Roots

```markdown
$$\sqrt{x}$$ or $$\sqrt[n]{x}$$
```

::stream-markdown{example="feature-mathematics.squareRoots"}
::

### Exponents and Subscripts

```markdown
$$x^2$$ or $$x_i$$ or $$x_i^2$$
```

::stream-markdown{example="feature-mathematics.exponents"}
::

### Greek Letters

```markdown
$$\alpha, \beta, \gamma, \delta, \theta, \pi, \sigma, \omega$$
$$\Gamma, \Delta, \Theta, \Pi, \Sigma, \Omega$$
```

::stream-markdown{example="feature-mathematics.greekLetters"}
::

### Summations

```markdown
$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$
```

::stream-markdown{example="feature-mathematics.summations"}
::

### Integrals

```markdown
$$\int_{a}^{b} f(x) \, dx$$
```

::stream-markdown{example="feature-mathematics.integrals"}
::

### Limits

```markdown
$$\lim_{x \to \infty} \frac{1}{x} = 0$$
```

::stream-markdown{example="feature-mathematics.limits"}
::

### Matrices

```markdown
$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$
```

::stream-markdown{example="feature-mathematics.matrices"}
::

## Advanced Examples

### The Quadratic Formula

```markdown
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

::stream-markdown{example="feature-mathematics.quadraticFormula"}
::

### Euler's Identity

```markdown
$$
e^{i\pi} + 1 = 0
$$
```

::stream-markdown{example="feature-mathematics.eulerIdentity"}
::

### Normal Distribution

```markdown
$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}
$$
```

::stream-markdown{example="feature-mathematics.normalDistribution"}
::

### Taylor Series

```markdown
$$
e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots
$$
```

::stream-markdown{example="feature-mathematics.taylorSeries"}
::

### Integration by Parts

```markdown
$$
\int u \, dv = uv - \int v \, du
$$
```

::stream-markdown{example="feature-mathematics.integrationByParts"}
::

## Special Operators and Symbols

### Comparison Operators

```markdown
$$\leq$$ $$\geq$$ $$\neq$$ $$\approx$$ $$\equiv$$
```

::stream-markdown{example="feature-mathematics.comparisonOperators"}
::

### Set Notation

```markdown
$$\in$$ $$\notin$$ $$\subset$$ $$\subseteq$$ $$\cup$$ $$\cap$$ $$\emptyset$$
```

::stream-markdown{example="feature-mathematics.setNotation"}
::

### Logic Symbols

```markdown
$$\land$$ $$\lor$$ $$\neg$$ $$\implies$$ $$\iff$$ $$\forall$$ $$\exists$$
```

::stream-markdown{example="feature-mathematics.logicSymbols"}
::

### Calculus Notation

```markdown
$$\frac{dy}{dx}$$ $$\frac{\partial f}{\partial x}$$ $$\nabla$$ $$\infty$$
```

::stream-markdown{example="feature-mathematics.calculusNotation"}
::

## Streaming Considerations

### Incomplete Equations

vue-stream-markdown's unterminated block parser handles incomplete equations gracefully:

```markdown
$$
E = mc^2
```

::stream-markdown{example="feature-mathematics.incompleteEquation" settled-mode="streaming"}
::

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

::stream-markdown{example="feature-mathematics.inlineVsBlock"}
::

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

::stream-markdown{example="feature-mathematics.currencyVsMath"}
::

### Spacing in Equations

Use `\,` for thin space, `\:` for medium space, `\;` for thick space:

```markdown
$$\int f(x) \, dx$$
```

::stream-markdown{example="feature-mathematics.spacingExample"}
::

## Resources

- [KaTeX Documentation](https://katex.org/docs/supported.html) - Complete list of supported functions
- [KaTeX Support Table](https://katex.org/docs/support_table.html) - Feature compatibility
- [LaTeX Math Symbols](https://www.overleaf.com/learn/latex/List_of_Greek_letters_and_math_symbols) - Symbol reference
