# GitHub Flavored Markdown

> Extended Markdown features including tables, task lists, strikethrough, and autolinks.

## Tables

Create formatted tables with alignment options:

```markdown
| Feature | Supported | Notes |
|---------|-----------|-------|
| Tables | ✅ | Full support |
| Task Lists | ✅ | Interactive |
| Strikethrough | ✅ | ~~Like this~~ |
```

Renders as:

| Feature | Supported | Notes |
|---------|-----------|-------|
| Tables | ✅ | Full support |
| Task Lists | ✅ | Interactive |
| Strikethrough | ✅ | ~~Like this~~ |

### Column Alignment

Control text alignment using colons in the separator row:

```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| A | B | C |
| 1 | 2 | 3 |
```

Result:

| Left | Center | Right |
|:-----|:------:|------:|
| A | B | C |
| 1 | 2 | 3 |

**Alignment Syntax:**
- `:---` - Left-aligned (default)
- `:---:` - Center-aligned
- `---:` - Right-aligned

### Table Features

Streamdown enhances tables with:
- **Responsive scrolling** - Tables scroll horizontally on narrow screens
- **Download button** - Export tables as CSV or JSON
- **Hover states** - Row highlighting for better readability
- **Proper spacing** - Optimized cell padding

### Complex Tables

Tables support inline formatting:

| Name | Description | Status |
|------|-------------|--------|
| **Streamdown** | A `react-markdown` replacement | ✅ Active |
| *Feature X* | Under development | 🚧 WIP |
| ~~Old Package~~ | Deprecated | ❌ Removed |

## Task Lists

Create interactive todo lists:

```markdown
- [x] Setup project structure
- [x] Install dependencies
- [ ] Write documentation
- [ ] Deploy to production
```

Renders as:
- [x] Setup project structure
- [x] Install dependencies
- [ ] Write documentation
- [ ] Deploy to production

### Task List Syntax

- `- [ ]` - Unchecked task (whitespace in brackets)
- `- [x]` - Checked task (lowercase x)
- `- [X]` - Also checked (uppercase X)

### Nested Task Lists

Task lists can be nested:

- [ ] Phase 1: Setup
  - [x] Initialize repository
  - [x] Configure build tools
  - [ ] Setup CI/CD
- [ ] Phase 2: Development
  - [ ] Implement features
  - [ ] Write tests

### Task Lists in Different Contexts

Task lists work in various contexts:

## Shopping List
- [ ] Milk
- [ ] Eggs
- [x] Bread

> **Note**: Here's a quote with tasks:
> - [x] Complete quote formatting
> - [ ] Add more examples

## Strikethrough

Mark text as deleted or outdated:

```markdown
~~This approach is deprecated~~
Use this **new method** instead.
```

Result:
~~This approach is deprecated~~
Use this **new method** instead.

### Multiple Words

Strikethrough works across multiple words:

```markdown
~~This entire sentence is struck through.~~
```

Result:
~~This entire sentence is struck through.~~

### In Context

```markdown
**Before:** ~~500ms response time~~
**After:** 50ms response time ⚡
```

Result:
**Before:** ~~500ms response time~~
**After:** 50ms response time ⚡

## Autolinks

URLs and email addresses are automatically converted to links:

Visit https://streamdown.ai for more info.
Contact us at hello@streamdown.ai
Check out github.com/vercel/streamdown

### URL Protocols

Autolinks work with common protocols:
- `http://` and `https://`
- `ftp://`
- `mailto:`

https://example.com
ftp://files.example.com
mailto:hello@example.com

## Line Breaks

GFM respects line breaks without requiring two spaces:

```markdown
This is line one
This is line two
This is line three
```

Standard Markdown would combine these into one paragraph, but GFM preserves the breaks.

To force a line break in standard Markdown:
Line one
Line two (note: two spaces after "one")
