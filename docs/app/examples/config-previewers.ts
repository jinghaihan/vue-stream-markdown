const htmlExample = `
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Preview Example</title>
  <style>
    html,
    body {
      height: 100%;
      margin: 0;
      padding: 0;
    }
    .container {
      height: 100%;
      box-sizing: border-box;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }
    .button {
      padding: 10px 20px;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }
  <\/style>
<\/head>
<body>
  <div class="container">
    <h2>Hello, World!</h2>
    <p>This is an HTML preview example.</p>
    <button class="button" onclick="alert('Clicked!')">
      Click Me
    </button>
  </div>
<\/body>
<\/html>
\`\`\`
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

// Previewers examples
const disableAllPreviewers = false

const disableHtmlPreviewer = {
  components: {
    html: false,
    mermaid: true,
  },
}

const disableMermaidPreviewer = {
  components: {
    html: true,
    mermaid: false,
  },
}

export { disableAllPreviewers, disableHtmlPreviewer, disableMermaidPreviewer, htmlExample, mermaidExample }
