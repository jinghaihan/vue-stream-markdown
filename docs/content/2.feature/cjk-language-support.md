---
title: CJK Language Support
navigation:
  icon: i-lucide-languages
description: Built-in support for Chinese, Japanese, and Korean languages with proper handling of emphasis markers and ideographic punctuation.
---

vue-stream-markdown includes built-in support for CJK (Chinese, Japanese, Korean) languages, ensuring that emphasis markers like bold and italic work correctly with ideographic punctuation. This is particularly important for AI-generated content, where language models naturally place emphasis markers around phrases that include or end with punctuation.

## The Problem

The CommonMark/GFM specification has a limitation where emphasis markers (\*_or_) adjacent to ideographic punctuation marks occasionally fail to be recognized. This causes formatting to break in CJK text:

```markdown
**この文は太字になりません（This won't be bolded）。**この文のせいで（It is due to this sentence）。
```

Without CJK-friendly parsing, the text above would render as plain text instead of bold because the closing \*\* appears next to the Japanese period.

## The Solution

Vue Stream Markdown combines [Comark](https://github.com/comarkdown/comark)'s Markdown parser with Markmend's streaming delimiter analysis. The completion layer treats CJK letters consistently with other Unicode letters and avoids inventing emphasis solely because a partial stream currently ends beside an asterisk, underscore, or tilde.

## Character Animation

Streaming animations use `animationSplit="auto"` by default. CJK characters are split individually, while nearby non-CJK text keeps word-based animation. Set `animationSplit` to `'char'` when you want to force character animation:

```vue
<StreamMarkdown
  content="CJK text can animate character by character."
  animation-split="char"
/>
```

Adjacent animation units start `40ms` apart by default. Use `animationStagger` to change the cadence, or set it to `0` to reveal each received batch at once:

```vue
<StreamMarkdown
  content="中文和 English can share one animation sequence."
  animation-split="auto"
  :animation-stagger="30"
/>
```

## Supported Features

### Bold Text with Punctuation

Works correctly with all ideographic punctuation marks:

```markdown
**日本語の文章（括弧付き）。**この文が後に続いても大丈夫です。
**中文文本（带括号）。**这句子继续也没问题。
**한국어 구문(괄호 포함)**을 강조.
```

::stream-markdown{example="feature-cjk-language-support.bold"}
::

### Italic Text with Punctuation

```markdown
*これは斜体のテキストです（括弧付き）。*この文が後に続いても大丈夫です。
*这是斜体文字（带括号）。*这句子继续也没问题。
*이 텍스트(괄호 포함)*는 기울임꼴입니다.
```

::stream-markdown{example="feature-cjk-language-support.italic"}
::

### Strikethrough with Punctuation

The same delimiter rules apply to strikethrough:

```markdown
~~削除されたテキスト（括弧付き）。~~この文は正しいです。
~~删除的文字（带括号）。~~这个句子是正确的。
~~이 텍스트(괄호 포함)~~를 삭제합니다.
```

::stream-markdown{example="feature-cjk-language-support.strikethrough"}
::

### Mixed Content

CJK and English text work seamlessly together:

```markdown
**重要提示（Important Notice）：**请注意。
```

::stream-markdown{example="feature-cjk-language-support.mixed"}
::
