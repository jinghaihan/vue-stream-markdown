---
title: GitHub Flavored Markdown
description: Full support for GFM including tables, task lists, strikethrough, and autolinks.
---

<script setup lang="ts">
const table = `
| Feature | Supported | Notes |
|---------|-----------|-------|
| Tables | ✅ | Full support |
| Task Lists | ✅ | Interactive |
| Strikethrough | ✅ | ~~Like this~~ |
`

const alignmentTable = `
| Left | Center | Right |
|:-----|:------:|------:|
| A | B | C |
| 1 | 2 | 3 |
`

const complexTable = `
| Name | Description | Status |
|------|-------------|--------|
| **Streamdown** | A \`react-markdown\` replacement | ✅ Active |
| *Feature X* | Under development | 🚧 WIP |
| ~~Old Package~~ | Deprecated | ❌ Removed |
`

const taskList = `
- [x] Setup project structure
- [x] Install dependencies
- [ ] Write documentation
- [ ] Deploy to production
`

const nestedTaskList = `
- [ ] Phase 1: Setup
  - [x] Initialize repository
  - [x] Configure build tools
  - [ ] Setup CI/CD
- [ ] Phase 2: Development
  - [ ] Implement features
  - [ ] Write tests
`

const complexTaskList = `
## Shopping List
- [ ] Milk
- [ ] Eggs
- [x] Bread

> **Note**: Here's a quote with tasks:
> - [x] Complete quote formatting
> - [ ] Add more examples
`

const strikethrough = `
**Before:** ~~500ms response time~~
**After:** 50ms response time ⚡
`

const autoLink = `
Visit https://streamdown.ai for more info.

Contact us at hello@streamdown.ai
`

const autoLink2 = `
Check out github.com/vercel/streamdown
`
</script>

# GitHub Flavored Markdown

vue-stream-markdown includes full support for GitHub Flavored Markdown (GFM) through [mdast-util-gfm](https://github.com/syntax-tree/mdast-util-gfm). This extends standard Markdown with powerful features commonly used on GitHub and other modern Markdown platforms.

## Tables

Create formatted tables with Table options:

```markdown
| Feature       | Supported | Notes         |
| ------------- | --------- | ------------- |
| Tables        | ✅        | Full support  |
| Task Lists    | ✅        | Interactive   |
| Strikethrough | ✅        | ~~Like this~~ |
```

<StreamMarkdown :content="table" />

### Column Alignment

Control text alignment using colons in the separator row:

```markdown
| Left | Center | Right |
| :--- | :----: | ----: |
| A    |   B    |     C |
| 1    |   2    |     3 |
```

<StreamMarkdown :content="alignmentTable" />

**Alignment Syntax:**

- `:---` - Left-aligned (default)
- `:---:` - Center-aligned
- `---:` - Right-aligned

vue-stream-markdown enhances tables with:

- **Responsive scrolling** - Tables scroll horizontally on narrow screens
- **Download button** - Export tables as CSV or JSON
- **Proper spacing** - Optimized cell padding

### Complex Tables

Tables support inline formatting:

```markdown
| Name            | Description                    | Status     |
| --------------- | ------------------------------ | ---------- |
| **Streamdown**  | A `react-markdown` replacement | ✅ Active  |
| _Feature X_     | Under development              | 🚧 WIP     |
| ~~Old Package~~ | Deprecated                     | ❌ Removed |
```

<StreamMarkdown :content="complexTable" />

## Interactive Features

Table include interactive buttons such as copy and download. To configure these controls, see the [Controls](/config/controls) documentation.

## Task Lists

Create interactive todo lists:

```markdown
- [x] Setup project structure
- [x] Install dependencies
- [ ] Write documentation
- [ ] Deploy to production
```

Renders as:
<StreamMarkdown :content="taskList" />

### Task List Syntax

- `- [ ]` - Unchecked task (whitespace in brackets)
- `- [x]` - Checked task (lowercase x)
- `- [X]` - Also checked (uppercase X)

### Nested Task Lists

Task lists can be nested:

```markdown
- [ ] Phase 1: Setup
  - [x] Initialize repository
  - [x] Configure build tools
  - [ ] Setup CI/CD
- [ ] Phase 2: Development
  - [ ] Implement features
  - [ ] Write tests
```

Renders as:
<StreamMarkdown :content="nestedTaskList" />

### Task Lists in Different Contexts

Task lists work in various contexts:

```markdown
## Shopping List

- [ ] Milk
- [ ] Eggs
- [x] Bread

> **Note**: Here's a quote with tasks:
>
> - [x] Complete quote formatting
> - [ ] Add more examples
```

Renders as:
<StreamMarkdown :content="complexTaskList" />

## Strikethrough

Mark text as deleted or outdated:

```markdown
**Before:** ~~500ms response time~~
**After:** 50ms response time ⚡
```

Result:
<StreamMarkdown :content="strikethrough" />

## Autolinks

URLs and email addresses are automatically converted to links:

```markdown
Visit https://streamdown.ai for more info.

Contact us at hello@streamdown.ai
```

<StreamMarkdown :content="autoLink" />
