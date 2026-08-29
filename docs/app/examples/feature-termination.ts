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

export { completeFootnote, completeImage, completeInlineMath, completeLink, completeTable, incompleteFootnote, incompleteImage, incompleteInlineMath, incompleteLink, incompleteTable, syntaxTrimming }
