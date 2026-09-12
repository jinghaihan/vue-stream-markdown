---
title: Configuration Overview
navigation:
  icon: i-lucide-settings
description: Configure parsing, rendering, controls, security, and integrations.
---

`Markdown` accepts the complete Markdown source and renders a [Comark](https://github.com/comarkdown/comark) document directly to Vue nodes.

## Core options

| Prop                | Type                                                 | Default        | Purpose                                                                     |
| ------------------- | ---------------------------------------------------- | -------------- | --------------------------------------------------------------------------- |
| `content`           | `string`                                             | `''`           | Markdown source to render                                                   |
| `mode`              | `'streaming' \| 'static'`                            | `'streaming'`  | Enable completion and streaming UI state, or parse settled source unchanged |
| `completion`        | `boolean \| CompletionOptions \| CompletionFunction` | `true`         | Configure, replace, or disable streaming completion                         |
| `parserOptions`     | `StreamMarkdownParserOptions`                        | `{}`           | Add Comark plugins or parser options                                        |
| `literalTagContent` | `string[]`                                           | `undefined`    | Treat configured custom-tag children as plain text                          |
| `components`        | `MarkdownComponents`                                 | `{}`           | Map native or custom tags to Vue components                                 |
| `dir`               | `'auto' \| 'ltr' \| 'rtl'`                           | `undefined`    | Configure text direction                                                    |
| `enableAnimate`     | `boolean`                                            | follows `mode` | Enable enter animations                                                     |
| `animation`         | `string`                                             | `'fade-in'`    | Select the enter animation                                                  |
| `animationSplit`    | `'auto' \| 'word' \| 'char'`                         | `'auto'`       | Select text animation granularity                                           |
| `animationDuration` | `number \| string`                                   | `180`          | Set animation duration                                                      |
| `animationStagger`  | `number`                                             | `40`           | Maximum start-time spread within a streaming batch (ms)                     |
| `caret`             | `'block' \| 'circle'`                                | `undefined`    | Show a streaming caret                                                      |

Code, math, and diagram renderers are configured through `extensions`. Display, control, preview, security, theme, and locale options remain on `Markdown` or `MarkdownProvider`.

## Streaming animation timing

`animationDuration` controls how long each entry animation lasts. `animationStagger` controls the maximum time spread between the first and last new words or characters in a received batch:

```vue
<Markdown
  :animation-duration="180"
  :animation-stagger="40"
  animation-split="auto"
/>
```

The default `auto` split animates Latin text by word and CJK text by character. Each batch follows document order, with its start times spread over the smaller of `animationStagger` and the recent interval between batches. When new content arrives, any still-waiting text from the previous batch starts immediately; running and completed animations are left alone. Waiting time does not accumulate across batches. Set `animationStagger` to `0` to make every new unit in a batch start together.

## Detailed configuration

- [Parser](/config/parser)
- [Components](/config/components)
- [Display Options](/config/display-options)
- [Controls](/config/controls)
- [Previewers](/config/previewers)
- [Security](/config/security)
- [Extensions](/config/extensions)
- [Internationalization](/config/i18n)
- [Custom UI Components](/feature/custom-ui-components)
