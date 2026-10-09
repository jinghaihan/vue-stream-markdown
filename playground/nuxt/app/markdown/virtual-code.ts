const javascript = Array.from({ length: 2000 }, (_, index) => {
  if (index === 1000)
    return `const longLine = "${'horizontal-scroll-'.repeat(40)}"`
  return `console.log("Row ${index + 1}", ${index + 1})`
}).join('\n')

const python = Array.from({ length: 500 }, (_, index) => `print("Row ${index + 1}")`).join('\n')

export const virtualCode = `# Virtual Code Scrolling / 代码虚拟滚动

This example enables virtual scrolling with a 300px height limit.
Use **Settings → Code Block** to toggle virtual scrolling or switch Modern / Classic / Minimal.
Set the height to 0 to check the unbounded fallback. Fullscreen remains bounded.

本示例自动开启虚拟滚动，最大高度为 300px。通过 **设置 → 代码块** 对比开关和三种样式。
高度设为 0 可检查普通视图的回退渲染；全屏仍使用虚拟滚动。

- Scroll to the middle and bottom: line numbers and highlighting should stay correct.
- Scroll sideways near row 1001: the long line should stay reachable without the horizontal range jumping.
- Copy / download / fullscreen should use all 2000 lines.
- Press Play to stream or replay the example. The code viewport follows appended lines at the bottom; scrolling up pauses following, returning to the bottom resumes it.

- 上下滚动检查行号和高亮；在第 1001 行横向滚动检查长行，滚动范围不应跳变。
- 复制、下载、全屏应保留完整的 2000 行。
- 点播放即可检查流式追加或重播。代码区域在底部时跟随，向上滚动后停止跟随，回到底部后继续。

## 2000-line JavaScript

\`\`\`javascript
${javascript}
\`\`\`

## Custom starting line

The next block starts at line 42 and contains 500 lines.

\`\`\`python startLine=42
${python}
\`\`\`

## Hidden line numbers

\`\`\`python noLineNumbers
${python}
\`\`\`
`
