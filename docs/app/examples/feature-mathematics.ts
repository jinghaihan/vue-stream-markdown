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

export { blockMath, calculusNotation, comparisonOperators, currencyVsMath, eulerIdentity, exponents, fractions, greekLetters, incompleteEquation, inlineMath, inlineVsBlock, integrals, integrationByParts, limits, logicSymbols, matrices, normalDistribution, quadraticFormula, setNotation, spacingExample, squareRoots, summations, taylorSeries }
