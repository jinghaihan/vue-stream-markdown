# Contributing

Thank you for your interest in contributing to **vue-stream-markdown**! This guide will help you report issues effectively and contribute to the project.

## Reporting Issues

When reporting bugs or issues, providing detailed information helps diagnose and fix problems more efficiently. The playground provides tools to help gather this information.

### Using the Playground

The [playground](https://play-vue-stream-markdown.netlify.app/) supports generating shareable links and provides streaming controls (forward/backward navigation) for debugging streaming rendering issues.

### Steps to Report an Issue

If you encounter any problems, please follow these steps:

1. **Generate Shareable Link**
   - Use the **Generate Share Links** button in the playground to create a shareable link with your current content
   - This link contains all the necessary information to reproduce the issue

2. **Enable AST Result**
   - Enable the **AST Result** toggle to view the parsed AST syntax tree
   - This helps understand how the markdown is being parsed

3. **Collect Information**
   - Copy the markdown content at the time of the issue
   - Copy the AST syntax tree displayed in the playground
   - Note any error messages or unexpected behavior

4. **Create the Issue**
   - Provide the shareable link from step 1
   - Include the markdown content from step 3
   - Include the AST syntax tree from step 3
   - Describe the expected behavior vs. actual behavior
   - Include steps to reproduce if applicable

### What Information to Include

When creating an issue, please provide:

- **Shareable link** - Generated from the playground
- **Markdown content** - The markdown text that causes the issue
- **AST syntax tree** - The parsed AST structure (from AST Result toggle)
- **Description** - Clear description of the problem
- **Expected behavior** - What you expected to happen
- **Actual behavior** - What actually happened
- **Environment** - Browser, version, OS (if relevant)

This information helps reproduce and diagnose the problem more effectively.
