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
| `smoothing`         | `false \| 'balanced' \| 'realtime' \| 'silky'`       | `'balanced'`   | Smooth append-only updates before parsing                                   |
| `animation`         | `string`                                             | `'fade-in'`    | Select the enter animation                                                  |
| `animationSplit`    | `'auto' \| 'word' \| 'char'`                         | `'auto'`       | Select text animation granularity                                           |
| `animationDuration` | `number \| string`                                   | `180`          | Set animation duration                                                      |
| `caret`             | `'block' \| 'circle'`                                | `undefined`    | Show a streaming caret                                                      |

Code, math, and diagram renderers are configured through `extensions`. Display, control, preview, security, theme, and locale options remain on `Markdown` or `MarkdownProvider`.

## Streaming animation timing

`animationDuration` controls how long each entry animation lasts. New text parts in each streaming update begin together, so smoothing controls the pacing between updates:

```vue
<Markdown
  :animation-duration="180"
  animation-split="auto"
/>
```

The default `auto` split animates Latin text by word and CJK text by character. Smoothing controls how frequently new batches are exposed while animation duration controls how long each batch enters.

Streaming smoothing adapts its output to the input rate and waits for each parse before exposing the next prefix. Use `smoothing: false` to parse every source update without buffering, or choose `'realtime'` and `'silky'` to trade off responsiveness and pacing.

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
