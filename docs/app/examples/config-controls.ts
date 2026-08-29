const tableExample = `
| Name | Age | City |
|------|-----|------|
| Alice | 30 | New York |
| Bob | 25 | London |
| Charlie | 35 | Tokyo |
`

const codeExample = `
\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);
\`\`\`
`

const imageExample = `
![Placeholder Image](https://placehold.co/600x400)
`

const imageListExample = `
![Placeholder Image](https://placehold.co/600x400)
![Placeholder Image](https://placehold.co/600x500)
`

const mermaidExample = `
\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\`
`

// Table controls examples
const tableOnlyCopy = {
  table: {
    copy: true,
    download: false,
    fullscreen: false,
  },
}

const tableOnlyDownload = {
  table: {
    copy: false,
    download: true,
    fullscreen: false,
  },
}

const tableOnlyFullscreen = {
  table: {
    copy: false,
    download: false,
    fullscreen: true,
  },
}

// Code controls examples
const codeOnlyCollapse = {
  code: {
    collapse: true,
    copy: false,
    download: false,
    fullscreen: false,
  },
}

const codeOnlyCopy = {
  code: {
    collapse: false,
    copy: true,
    download: false,
    fullscreen: false,
  },
}

const codeOnlyDownload = {
  code: {
    collapse: false,
    copy: false,
    download: true,
    fullscreen: false,
  },
}

const codeOnlyFullscreen = {
  code: {
    collapse: false,
    copy: false,
    download: false,
    fullscreen: true,
  },
}

// Image controls examples
const imageOnlyDownload = {
  image: {
    download: true,
    carousel: false,
    flip: false,
    rotate: false,
  },
}

const imageOnlyCarousel = {
  image: {
    download: false,
    carousel: true,
    flip: false,
    rotate: false,
  },
}

const imageOnlyFlip = {
  image: {
    download: false,
    carousel: false,
    flip: true,
    rotate: false,
  },
}

const imageOnlyRotate = {
  image: {
    download: false,
    carousel: false,
    flip: false,
    rotate: true,
  },
}

const imageTopRight = {
  image: {
    controlPosition: 'top-right',
  },
}

// Mermaid controls examples
const mermaidTopLeft = {
  mermaid: {
    position: 'top-left',
  },
}

const mermaidTopRight = {
  mermaid: {
    position: 'top-right',
  },
}

const mermaidBottomLeft = {
  mermaid: {
    position: 'bottom-left',
  },
}

export { codeExample, codeOnlyCollapse, codeOnlyCopy, codeOnlyDownload, codeOnlyFullscreen, imageExample, imageListExample, imageOnlyCarousel, imageOnlyDownload, imageOnlyFlip, imageOnlyRotate, imageTopRight, mermaidBottomLeft, mermaidExample, mermaidTopLeft, mermaidTopRight, tableExample, tableOnlyCopy, tableOnlyDownload, tableOnlyFullscreen }
