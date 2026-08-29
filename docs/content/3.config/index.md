---
title: Configuration Overview
navigation:
  icon: i-lucide-settings
description: Configure parsing, rendering, controls, security, and integrations.
---

`Markdown` accepts the complete Markdown source and renders a Comark document directly to Vue nodes.

## Core options

| Prop                | Type                                          | Default           | Purpose                                                                     |
| ------------------- | --------------------------------------------- | ----------------- | --------------------------------------------------------------------------- |
| `content`           | `string`                                      | `''`              | Markdown source to render                                                   |
| `mode`              | `'streaming' \| 'static'`                     | `'streaming'`     | Enable completion and streaming UI state, or parse settled source unchanged |
| `completion`        | `CompletionOptions \| ((markdown) => string)` | Markmend defaults | Configure or replace streaming completion                                   |
| `parserOptions`     | `StreamMarkdownParserOptions`                 | `{}`              | Add Comark plugins or parser options                                        |
| `components`        | `MarkdownComponents`                          | `{}`              | Map native or custom tags to Vue components                                 |
| `dir`               | `'auto' \| 'ltr' \| 'rtl'`                    | `undefined`       | Configure text direction                                                    |
| `enableAnimate`     | `boolean`                                     | follows `mode`    | Enable enter animations                                                     |
| `animation`         | `string`                                      | `'fade-in'`       | Select the enter animation                                                  |
| `animationSplit`    | `'auto' \| 'word' \| 'char'`                  | `'auto'`          | Select text animation granularity                                           |
| `animationDuration` | `number \| string`                            | `500`             | Set animation duration                                                      |
| `caret`             | `'block' \| 'circle'`                         | `undefined`       | Show a streaming caret                                                      |

The existing code, Mermaid, math, image, table, controls, previewer, security, theme, locale, and CDN options remain available.

## Detailed configuration

- [Parser](/config/parser)
- [Components](/config/components)
- [Display Options](/config/display-options)
- [Controls](/config/controls)
- [Previewers](/config/previewers)
- [Security](/config/security)
- [External Options](/config/external-options)
- [Internationalization](/config/i18n)
- [Custom UI Components](/feature/custom-ui-components)
