const codeExample = `
\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);
\`\`\`
`

const languageIconOnly = {
  languageIcon: true,
  languageName: false,
  lineNumbers: false,
}

const languageNameOnly = {
  languageIcon: false,
  languageName: true,
  lineNumbers: false,
}

const lineNumbersOnly = {
  languageIcon: false,
  languageName: false,
  lineNumbers: true,
}

const allEnabled = {
  languageIcon: true,
  languageName: true,
  lineNumbers: true,
}

const imageWithCaption = `
![Placeholder Image](https://placehold.co/600x400 "Placeholder Image with Caption")
`

const imageWithoutCaption = `
![Placeholder Image](https://placehold.co/600x400 "Placeholder Image without Caption")
`

const imageWithFallback = `
![Broken Image](https://nonexistent-image.com/image.png "This will show fallback")
`

export { allEnabled, codeExample, imageWithCaption, imageWithFallback, imageWithoutCaption, languageIconOnly, languageNameOnly, lineNumbersOnly }
