import { describe, expect, it } from 'vitest'
import { preprocess } from '../../src/preprocess'

describe('preprocess', () => {
  it('should complete unclosed ** in streaming content', () => {
    expect(preprocess('Hello **world')).toBe('Hello **world**')
  })

  it('should complete unclosed * in streaming content', () => {
    expect(preprocess('Hello *world')).toBe('Hello *world*')
  })

  it('should complete unclosed links in streaming content', () => {
    expect(preprocess('[Google](https://www.goo')).toBe('[Google](https://www.goo)')
  })

  it('should complete unclosed images in streaming content', () => {
    expect(preprocess('![alt](https://image.png')).toBe('![alt](https://image.png)')
  })

  it('should complete mixed unclosed ** and *', () => {
    expect(preprocess('**bold and *mixed')).toBe('**bold and *mixed***')
  })

  it('should only process last paragraph after blank lines', () => {
    expect(preprocess('Para1 **unclosed\n\nPara2 *text'))
      .toBe('Para1 **unclosed\n\nPara2 *text*')
  })

  it('should not modify already complete markdown', () => {
    expect(preprocess('**bold** and *italic* text'))
      .toBe('**bold** and *italic* text')
  })

  it('should not complete bare markers without content', () => {
    expect(preprocess('Hello\n\n**')).toBe('Hello\n\n')
    expect(preprocess('Hello\n\n*')).toBe('Hello\n\n')
  })

  it('should handle real-world streaming with multiple elements', () => {
    expect(preprocess('## Title\n\nText **bold\n\n> Quote\n\nLast *italic'))
      .toBe('## Title\n\nText **bold\n\n> Quote\n\nLast *italic*')
  })

  it('should complete syntax spanning multiple lines in same paragraph', () => {
    expect(preprocess('Hello **world\nand more text'))
      .toBe('Hello **world\nand more text**')
  })

  it('should handle mixed formatting with links', () => {
    expect(preprocess('Text **bold** and [link'))
      .toBe('Text **bold** and [link]()')
  })

  it('should complete unclosed inline code in streaming content', () => {
    expect(preprocess('Hello `world')).toBe('Hello `world`')
  })

  it('should complete unclosed code blocks in streaming content', () => {
    expect(preprocess('```javascript\nconst x = 1')).toBe('```javascript\nconst x = 1\n```')
  })

  it('should handle mixed formatting with code', () => {
    expect(preprocess('Text **bold** and `code'))
      .toBe('Text **bold** and `code`')
  })

  it('should handle code blocks with other formatting', () => {
    expect(preprocess('```js\ncode\n```\n\n**bold text'))
      .toBe('```js\ncode\n```\n\n**bold text**')
  })
})
