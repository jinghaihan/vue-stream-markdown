# Introduction

**vue-stream-markdown** is a Vue 3 component library designed for streaming Markdown rendering, especially optimized for AI model outputs. This project is inspired by [streamdown](https://streamdown.ai/) and extends its capabilities with more aggressive optimizations for streaming scenarios.

## The Problem with Streaming Markdown

When you stream Markdown content from AI models, new challenges emerge that traditional Markdown renderers weren't designed to handle:

- **Incomplete syntax** - Bold text that hasn't been closed yet: `**This is bol`
- **Partial code blocks** - Code blocks missing their closing backticks
- **Unterminated links** - Links without closing brackets: `[Click here`
- **Progressive rendering** - Content that updates token-by-token

## How Streamdown Solves It

[Streamdown](https://streamdown.ai/) has spawned [`remend`](https://github.com/vercel/streamdown/blob/main/packages/remend/README.md), a library that handles most of the completion work in streaming output, including:

- **Parsing incomplete blocks** - Automatically detects and completes unterminated Markdown syntax
- **Progressive formatting** - Applies styling to partial content as it streams in

## Enhanced Streaming Optimizations

While this project is inspired by streamdown, it's not just a Vue version. It implements more **aggressive** optimizations for streaming scenarios:

- **Links**
  - **Streamdown**: Extract the text content and display it as plain text
  - **This library**: Complete link syntax while disabling click interactions. Only show the clickable underline when the link is fully completed, preventing broken navigation

- **Images**
  - **Streamdown**: For images with incomplete URLs, remove them entirely
  - **This library**: Complete the image syntax and add a loading state, providing better visual feedback during streaming

- **Tables**
  - **This library**: Proactively complete table syntax and provide a loading state, ensuring smooth rendering even when table structure is incomplete

- **Inline Math**
  - **Streamdown**: Doesn't handle inline KaTeX with single `$` as they're likely currency symbols
  - **This library**: Attempts to complete inline math syntax, providing better support for mathematical expressions in streaming content

- **Syntax Trimming**
  - **This library**: For syntax characters like `` ` ``, `*`, `_` that often indicate the start of a syntax block, the library attempts to trim them when they appear at the end of content, reducing visual artifacts during streaming

## Acknowledgments

This project is deeply inspired by [streamdown](https://streamdown.ai/). Special thanks to the streamdown team for their innovative approach to streaming Markdown rendering, which laid the foundation for this work.
