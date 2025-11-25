# CJK Language Support

> Full support for Chinese, Japanese, and Korean text with proper emphasis formatting.

## Supported Features

### Bold Text with Punctuation

Works correctly with all ideographic punctuation marks:

**日本語の文章（括弧付き）。**この文が後に続いても大丈夫です。
**中文文本（带括号）。**这句子继续也没问题。
**한국어 구문(괄호 포함)**을 강조.

### Italic Text with Punctuation

Streamdown includes `remark-cjk-friendly-gfm-strikethrough` for proper strikethrough support:

*これは斜体のテキストです（括弧付き）。*この文が後に続いても大丈夫です。
*这是斜体文字（带括号）。*这句子继续也没问题。
*이 텍스트(괄호 포함)*는 기울임꼴입니다.

### Strikethrough with Punctuation

~~削除されたテキスト（括弧付き）。~~この文は正しいです。
~~删除的文字（带括号）。~~这个句子是正确的。
~~이 텍스트(괄호 포함)~~를 삭제합니다.

### Mixed Content

CJK and English text work seamlessly together:

**重要提示（Important Notice）：**请注意。

## Supported Punctuation

The plugin handles all common ideographic punctuation marks:

- Parentheses: `（）`
- Brackets: `【】「」〈〉`
- Periods: `。．`
- Commas: `，、`
- Questions: `？`
- Exclamations: `！`
- Colons: `：`
