import { describe, expect, it } from 'vitest'
import { fixDelete } from '../../src/preprocess/delete'

describe('fixDelete', () => {
  it('should complete unclosed ~~ with content', () => {
    expect(fixDelete('Hello ~~world')).toBe('Hello ~~world~~')
  })

  it('should not modify already closed ~~', () => {
    expect(fixDelete('Hello ~~world~~')).toBe('Hello ~~world~~')
  })

  it('should remove bare ~~ without content', () => {
    expect(fixDelete('~~')).toBe('')
    expect(fixDelete('Hello\n\n~~')).toBe('Hello\n\n')
  })

  it('should only process last paragraph after blank line', () => {
    expect(fixDelete('Para1 ~~unclosed\n\nPara2 ~~text')).toBe('Para1 ~~unclosed\n\nPara2 ~~text~~')
  })

  it('should handle multiple ~~ in same paragraph', () => {
    expect(fixDelete('~~a~~ and ~~b')).toBe('~~a~~ and ~~b~~')
    expect(fixDelete('~~a~~ and ~~b~~')).toBe('~~a~~ and ~~b~~')
  })

  it('should handle ~~ spanning multiple lines in same paragraph', () => {
    expect(fixDelete('Hello ~~world\nand more text')).toBe('Hello ~~world\nand more text~~')
  })

  it('should not complete when last paragraph has balanced ~~', () => {
    expect(fixDelete('## Title\n\nHello ~~world~~\n\nNext ~~para~~'))
      .toBe('## Title\n\nHello ~~world~~\n\nNext ~~para~~')
  })

  it('should handle empty content', () => {
    expect(fixDelete('')).toBe('')
  })

  it('should handle content with only whitespace after ~~', () => {
    expect(fixDelete('Hello ~~   ')).toBe('Hello ')
  })

  it('should handle mixed formatting with other markdown', () => {
    expect(fixDelete('**bold** and ~~strike')).toBe('**bold** and ~~strike~~')
  })

  it('should handle ~~ at the beginning of paragraph', () => {
    expect(fixDelete('~~deleted text')).toBe('~~deleted text~~')
  })

  it('should handle multiple paragraphs with unclosed ~~ only in last', () => {
    expect(fixDelete('First ~~complete~~\n\nSecond ~~incomplete'))
      .toBe('First ~~complete~~\n\nSecond ~~incomplete~~')
  })

  it('should handle ~~text~~~ (complete strikethrough followed by single ~)', () => {
    expect(fixDelete('~~Old approach~~~')).toBe('~~Old approach~~~')
  })

  it('should handle ~~text~ (incomplete strikethrough)', () => {
    expect(fixDelete('~~Old approach~')).toBe('~~Old approach~~')
  })

  it('should handle complex scenarios with mixed ~ and ~~', () => {
    // Single ~ at end after complete strikethrough - should not complete
    expect(fixDelete('~~complete~~ text~')).toBe('~~complete~~ text')

    // Incomplete strikethrough ending with single ~
    expect(fixDelete('~~incomplete text~')).toBe('~~incomplete text~~')
  })

  it('should handle edge cases with whitespace and single ~', () => {
    expect(fixDelete('~~text ~')).toBe('~~text ~~')
    // This case: ~~ followed by space and single ~ should be completed
    // because we have unclosed ~~ with content (space)
    expect(fixDelete('~~ ~')).toBe('~~ ~~')
  })
})
