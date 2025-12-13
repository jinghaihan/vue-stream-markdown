# Mathematics

> Render beautiful LaTeX equations with KaTeX support in Streamdown.

## Syntax

Streamdown uses double dollar signs (`$$`) to delimit mathematical expressions. Unlike traditional LaTeX, single dollar signs (`$`) are **not** used to avoid conflicts with currency symbols in regular text.

### Inline Math

Wrap inline mathematical expressions with `$$`:

```markdown
The quadratic formula is $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$ for solving equations.
```

Renders as: The quadratic formula is $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$ for solving equations.

### Block Math

For display-style equations, place `$$` delimiters on separate lines:

```markdown
$$
E = mc^2
$$
```

This renders the equation centered and larger:

$$
E = mc^2
$$

## Common Mathematical Expressions

### Fractions

```markdown
$$\frac{1}{2}$$, $$\frac{a + b}{c - d}$$
```

Example: $$\frac{1}{2}$$, $$\frac{a + b}{c - d}$$

### Square Roots

```markdown
$$\sqrt{16} = 4$$, $$\sqrt[3]{27} = 3$$
```

Example: $$\sqrt{16} = 4$$, $$\sqrt[3]{27} = 3$$

### Exponents and Subscripts

```markdown
$$a^2 + b^2 = c^2$$, $$x_1, x_2, \ldots, x_n$$
```

Example: $$a^2 + b^2 = c^2$$, $$x_1, x_2, \ldots, x_n$$

### Greek Letters

```markdown
$$\alpha, \beta, \gamma, \delta, \epsilon, \pi, \sigma, \phi, \omega$$
```

Common letters: $$\alpha, \beta, \gamma, \delta, \epsilon, \pi, \sigma, \phi, \omega$$

### Summations

```markdown
$$n$$ natural numbers: $$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$
```

The sum of first $$n$$ natural numbers: $$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$

### Integrals

```markdown
$$\int_{0}^{1} x^2 \, dx = \frac{1}{3}$$
```

Definite integral: $$\int_{0}^{1} x^2 \, dx = \frac{1}{3}$$

### Limits

```markdown
$$\lim_{x \to 0} \frac{\sin x}{x} = 1$$
```

Example: $$\lim_{x \to 0} \frac{\sin x}{x} = 1$$

### Matrices

```markdown
$$
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
$$
```

A 2×2 matrix:

$$
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
$$

## Advanced Examples

### The Quadratic Formula

```markdown
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

### Euler's Identity

```markdown
$$
e^{i\pi} + 1 = 0
$$
```

$$
e^{i\pi} + 1 = 0
$$

### Normal Distribution

```markdown
$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}
$$
```

The probability density function:

$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}
$$
### Taylor Series

```markdown
$$
e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots
$$
```

$$
e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots
$$
### Integration by Parts

```markdown
$$
\int u \, dv = uv - \int v \, du
$$
```

$$
\int u \, dv = uv - \int v \, du
$$
## Special Operators and Symbols

### Comparison Operators

```markdown
$$x \leq y$$, $$a \geq b$$, $$x \neq 0$$, $$\pi \approx 3.14$$, $$a \equiv b \pmod{n}$$
```

$$x \leq y$$, $$a \geq b$$, $$x \neq 0$$, $$\pi \approx 3.14$$, $$a \equiv b \pmod{n}$$

### Set Notation

```markdown
$$\in$$ $$\notin$$ $$\subset$$ $$\subseteq$$ $$\cup$$ $$\cap$$ $$\emptyset$$
```

$$x \in A$$, $$y \notin B$$, $$A \subset B$$, $$A \cup B$$, $$A \cap B$$, $$\emptyset$$

### Logic Symbols

```markdown
$$p \land q$$, $$p \lor q$$, $$\neg p$$, $$p \implies q$$, $$p \iff q$$, $$\forall x$$, $$\exists y$$
```

$$p \land q$$, $$p \lor q$$, $$\neg p$$, $$p \implies q$$, $$p \iff q$$, $$\forall x$$, $$\exists y$$

### Calculus Notation

```markdown
$$\frac{dy}{dx}$$, Partial: $$\frac{\partial f}{\partial x}$$, Gradient: $$\nabla f$$, Infinity: $$\infty$$
```

Derivative: $$\frac{dy}{dx}$$, Partial: $$\frac{\partial f}{\partial x}$$, Gradient: $$\nabla f$$, Infinity: $$\infty$$
