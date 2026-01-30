---
title: CJK Language Support
description: Built-in support for Chinese, Japanese, and Korean languages with proper handling of emphasis markers and ideographic punctuation.
---

<script setup>
const bold = `
Japanese: **日本語の文章（括弧付き）。**この文が後に続いても大丈夫です。
Chinese: **中文文本（带括号）。**这句子继续也没问题。
Korean: **한국어 구문(괄호 포함)**을 강조.
`

const italic = `
Japanese: *これは斜体のテキストです（括弧付き）。*この文が後に続いても大丈夫です。
Chinese: *这是斜体文字（带括号）。*这句子继续也没问题。
Korean: *이 텍스트(괄호 포함)*는 기울임꼴입니다.
`

const strikethrough = `
Japanese: ~~削除されたテキスト（括弧付き）。~~この文は正しいです。
Chinese: ~~删除的文字（带括号）。~~这个句子是正确的。
Korean: ~~이 텍스트(괄호 포함)~~를 삭제합니다.
`

const mixed = `**重要提示（Important Notice）：**请注意。`
</script>

# CJK Language Support

vue-stream-markdown includes built-in support for CJK (Chinese, Japanese, Korean) languages, ensuring that emphasis markers like bold and italic work correctly with ideographic punctuation. This is particularly important for AI-generated content, where language models naturally place emphasis markers around phrases that include or end with punctuation.

## The Problem

The CommonMark/GFM specification has a limitation where emphasis markers (** or *) adjacent to ideographic punctuation marks occasionally fail to be recognized. This causes formatting to break in CJK text:

```markdown
**この文は太字になりません（This won't be bolded）。**この文のせいで（It is due to this sentence）。
```

Without CJK-friendly parsing, the text above would render as plain text instead of bold because the closing ** appears next to the Japanese period.

## The Solution

vue-stream-markdown uses the `micromark-extension-cjk-friendly` and `micromark-extension-cjk-friendly-gfm-strikethrough` plugins to handle CJK text properly. These plugins implement an improved parsing approach that correctly recognizes emphasis markers adjacent to ideographic punctuation.

## Supported Features

### Bold Text with Punctuation

Works correctly with all ideographic punctuation marks:

```markdown
**日本語の文章（括弧付き）。**この文が後に続いても大丈夫です。
**中文文本（带括号）。**这句子继续也没问题。
**한국어 구문(괄호 포함)**을 강조.
```

<StreamMarkdown :content="bold" />

### Italic Text with Punctuation

```markdown
*これは斜体のテキストです（括弧付き）。*この文が後に続いても大丈夫です。
*这是斜体文字（带括号）。*这句子继续也没问题。
*이 텍스트(괄호 포함)*는 기울임꼴입니다.
```

<StreamMarkdown :content="italic" />

### Strikethrough with Punctuation

vue-markdown-stream includes `micromark-extension-cjk-friendly-gfm-strikethrough` for proper strikethrough support:

```markdown
~~削除されたテキスト（括弧付き）。~~この文は正しいです。
~~删除的文字（带括号）。~~这个句子是正确的。
~~이 텍스트(괄호 포함)~~를 삭제합니다.
```

<StreamMarkdown :content="strikethrough" />

### Mixed Content

CJK and English text work seamlessly together:

```markdown
**重要提示（Important Notice）：**请注意。
```

<StreamMarkdown :content="mixed" />
