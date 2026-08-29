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

export { bold, italic, mixed, strikethrough }
