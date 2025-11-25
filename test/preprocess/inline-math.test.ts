import { describe, expect, it } from 'vitest'
import { fixInlineMath } from '../../src/preprocess/inline-math'

describe('fixInlineMath', () => {
  it('should complete unclosed $$ with content', () => {
    expect(fixInlineMath('The formula is $$x = 1')).toBe('The formula is $$x = 1$$')
  })

  it('should not modify already closed $$', () => {
    expect(fixInlineMath('The formula is $$x = 1$$')).toBe('The formula is $$x = 1$$')
  })

  it('should remove bare $$ without content', () => {
    expect(fixInlineMath('$$')).toBe('')
    expect(fixInlineMath('Hello\n\n$$')).toBe('Hello\n\n')
  })

  it('should only process last paragraph after blank line', () => {
    expect(fixInlineMath('Para1 $$x$$\n\nPara2 $$y')).toBe('Para1 $$x$$\n\nPara2 $$y$$')
  })

  it('should handle multiple $$ in same paragraph', () => {
    expect(fixInlineMath('$$a$$ and $$b')).toBe('$$a$$ and $$b$$')
    expect(fixInlineMath('$$a$$ and $$b$$')).toBe('$$a$$ and $$b$$')
  })

  it('should handle $$ spanning multiple lines in same paragraph', () => {
    expect(fixInlineMath('Hello $$world\nand more text')).toBe('Hello $$world\nand more text$$')
  })

  it('should not complete when last paragraph has balanced $$', () => {
    expect(fixInlineMath('## Title\n\nHello $$world$$\n\nNext $$para$$'))
      .toBe('## Title\n\nHello $$world$$\n\nNext $$para$$')
  })

  it('should not complete block math ($$ on its own line)', () => {
    expect(fixInlineMath('$$\nE = mc^2')).toBe('$$\nE = mc^2')
    expect(fixInlineMath('$$\nE = mc^2\n')).toBe('$$\nE = mc^2\n')
  })

  it('should not complete block math ($$ at line start)', () => {
    expect(fixInlineMath('$$\nE = mc^2')).toBe('$$\nE = mc^2')
  })

  it('should complete when ending with single $ after content', () => {
    // When there's content before the single $, it should be completed to $$
    expect(fixInlineMath('$$\\int u \\, dv = uv - \\int v \\, du$')).toBe('$$\\int u \\, dv = uv - \\int v \\, du$$')
    expect(fixInlineMath('The formula is $$x = 1$')).toBe('The formula is $$x = 1$$')
  })

  it('should not complete when ending with just a single $ (no content)', () => {
    // When it's just $$$ with no content, don't complete
    expect(fixInlineMath('$$$')).toBe('$$$')
  })

  it('should complete when ending with single $ in multi-paragraph', () => {
    // When last paragraph ends with single $ after content, should complete
    expect(fixInlineMath('Para1 $$x$$\n\nPara2 $$y = 1$')).toBe('Para1 $$x$$\n\nPara2 $$y = 1$$')
  })

  it('should handle complex math expressions', () => {
    expect(fixInlineMath('The sum: $$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}')).toBe('The sum: $$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$')
    expect(fixInlineMath('Integration: $$\\int u \\, dv = uv - \\int v \\, du')).toBe('Integration: $$\\int u \\, dv = uv - \\int v \\, du$$')
  })

  it('should not process inside code blocks', () => {
    const codeBlock = '```\n$$x = 1$$\n```'
    expect(fixInlineMath(codeBlock)).toBe(codeBlock)

    const codeBlockWithUnclosed = '```\n$$x = 1\n```'
    expect(fixInlineMath(codeBlockWithUnclosed)).toBe(codeBlockWithUnclosed)
  })

  it('should not process inside inline code (backticks)', () => {
    // Inline code with $$ should not trigger completion
    const inlineCode = 'Wrap inline mathematical expressions with `$$`:'
    expect(fixInlineMath(inlineCode)).toBe(inlineCode)

    const inlineCodeWithMath = 'Use `$$` to delimit math expressions'
    expect(fixInlineMath(inlineCodeWithMath)).toBe(inlineCodeWithMath)

    // Even if there's an unclosed $$ after inline code, it should complete
    const mixed = 'Use `$$` to delimit: $$x = 1'
    expect(fixInlineMath(mixed)).toBe('Use `$$` to delimit: $$x = 1$$')

    // Specific case: inline code ending with `$$`: should not complete
    const specificCase = 'Wrap inline mathematical expressions with `$$`:'
    expect(fixInlineMath(specificCase)).toBe(specificCase)
  })

  it('should not process when inside an unclosed code block', () => {
    const unclosedCodeBlock = '```\n$$x = 1$$\n'
    expect(fixInlineMath(unclosedCodeBlock)).toBe(unclosedCodeBlock)
  })

  it('should handle code blocks and math in same content', () => {
    const content = 'Code: ```\nconst x = 1\n```\n\nMath: $$y = 2'
    expect(fixInlineMath(content)).toBe('Code: ```\nconst x = 1\n```\n\nMath: $$y = 2$$')
  })

  it('should handle inline math with block math in same paragraph', () => {
    // Inline math should be completed, block math should not
    expect(fixInlineMath('Inline: $$x = 1$$\n\nBlock:\n$$\nE = mc^2')).toBe('Inline: $$x = 1$$\n\nBlock:\n$$\nE = mc^2')
  })

  it('should handle multiple paragraphs with mixed math', () => {
    const content = 'Para1 $$x$$\n\nPara2 $$y = 1$$\n\nPara3 $$z'
    expect(fixInlineMath(content)).toBe('Para1 $$x$$\n\nPara2 $$y = 1$$\n\nPara3 $$z$$')
  })

  it('should not interfere with block math that has content', () => {
    expect(fixInlineMath('$$\nE = mc^2\nMore text')).toBe('$$\nE = mc^2\nMore text')
  })
})
