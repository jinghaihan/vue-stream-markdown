---
title: GitHub Flavored Markdown
navigation:
  icon: i-lucide-github
description: Full support for GFM including tables, task lists, strikethrough, and autolinks.
---

Vue Stream Markdown parses GitHub Flavored Markdown through Comark, including tables, task lists, autolinks, and strikethrough.

## Tables

Create formatted tables with Table options:

```markdown
| Feature       | Supported | Notes         |
| ------------- | --------- | ------------- |
| Tables        | ✅        | Full support  |
| Task Lists    | ✅        | Interactive   |
| Strikethrough | ✅        | ~~Like this~~ |
```

::stream-markdown{example="feature-gfm.table"}
::

### Column Alignment

Control text alignment using colons in the separator row:

```markdown
| Left | Center | Right |
| :--- | :----: | ----: |
| A    |   B    |     C |
| 1    |   2    |     3 |
```

::stream-markdown{example="feature-gfm.alignmentTable"}
::

**Alignment Syntax:**

- `:---` - Left-aligned (default)
- `:---:` - Center-aligned
- `---:` - Right-aligned

vue-stream-markdown enhances tables with:

- **Responsive scrolling** - Tables scroll horizontally on narrow screens
- **Fullscreen view** - Open wide tables in a modal
- **Download button** - Export tables as CSV, TSV, or Markdown
- **Proper spacing** - Optimized cell padding

### Complex Tables

Tables support inline formatting:

```markdown
| Feature          | Description                         | Status     |
| ---------------- | ----------------------------------- | ---------- |
| **Code blocks**  | Optional `Shiki` highlighting       | ✅ Ready   |
| _Custom tags_    | Map tags to Vue components          | ✅ Ready   |
| ~~Legacy parser~~ | Replaced by incremental parsing     | ❌ Removed |
```

::stream-markdown{example="feature-gfm.complexTable"}
::

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
::stream-markdown{example="feature-gfm.taskList"}
::

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
::stream-markdown{example="feature-gfm.nestedTaskList"}
::

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
::stream-markdown{example="feature-gfm.complexTaskList"}
::

## Strikethrough

Mark text as deleted or outdated:

```markdown
**Before:** ~~500ms response time~~
**After:** 50ms response time ⚡
```

Result:
::stream-markdown{example="feature-gfm.strikethrough"}
::

## Autolinks

URLs and email addresses are automatically converted to links:

```markdown
Visit https://vue-stream-markdown.netlify.app for the documentation.

Browse https://github.com/jinghaihan/vue-stream-markdown for source and examples.

Contact jhh19980114@gmail.com
```

::stream-markdown{example="feature-gfm.autoLink"}
::
