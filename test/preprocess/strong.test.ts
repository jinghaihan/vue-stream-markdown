import { describe, expect, it } from 'vitest'
import { fixStrong } from '../../src/preprocess/strong'

describe('fixStrong', () => {
  it('should complete unclosed ** with content', () => {
    expect(fixStrong('Hello **world')).toBe('Hello **world**')
  })

  it('should not modify already closed **', () => {
    expect(fixStrong('Hello **world**')).toBe('Hello **world**')
  })

  it('should remove bare ** without content', () => {
    expect(fixStrong('**')).toBe('')
    expect(fixStrong('Hello\n\n**')).toBe('Hello\n\n')
  })

  it('should only process last paragraph after blank line', () => {
    expect(fixStrong('Para1 **unclosed\n\nPara2 **text')).toBe('Para1 **unclosed\n\nPara2 **text**')
  })

  it('should handle multiple ** in same paragraph', () => {
    expect(fixStrong('**a** and **b')).toBe('**a** and **b**')
    expect(fixStrong('**a** and **b**')).toBe('**a** and **b**')
  })

  it('should handle ** spanning multiple lines in same paragraph', () => {
    expect(fixStrong('Hello **world\nand more text')).toBe('Hello **world\nand more text**')
  })

  it('should not complete when last paragraph has balanced **', () => {
    expect(fixStrong('## Title\n\nHello **world**\n\nNext **para**'))
      .toBe('## Title\n\nHello **world**\n\nNext **para**')
  })

  // Double underscore strong tests
  describe('double underscore strong', () => {
    it('should complete unclosed __ with content', () => {
      expect(fixStrong('Hello __world')).toBe('Hello __world__')
    })

    it('should not modify already closed __', () => {
      expect(fixStrong('Hello __world__')).toBe('Hello __world__')
    })

    it('should remove bare __ without content', () => {
      expect(fixStrong('__')).toBe('')
      expect(fixStrong('Hello\n\n__')).toBe('Hello\n\n')
    })

    it('should only process last paragraph after blank line for __', () => {
      expect(fixStrong('Para1 __unclosed\n\nPara2 __text')).toBe('Para1 __unclosed\n\nPara2 __text__')
    })

    it('should handle multiple __ in same paragraph', () => {
      expect(fixStrong('__a__ and __b')).toBe('__a__ and __b__')
      expect(fixStrong('__a__ and __b__')).toBe('__a__ and __b__')
    })

    it('should handle __ spanning multiple lines in same paragraph', () => {
      expect(fixStrong('Hello __world\nand more text')).toBe('Hello __world\nand more text__')
    })

    it('should not complete when last paragraph has balanced __', () => {
      expect(fixStrong('## Title\n\nHello __world__\n\nNext __para__'))
        .toBe('## Title\n\nHello __world__\n\nNext __para__')
    })

    it('should not interfere with ** when using __', () => {
      expect(fixStrong('**asterisk** and __underscore')).toBe('**asterisk** and __underscore__')
      expect(fixStrong('__underscore__ and **asterisk')).toBe('__underscore__ and **asterisk**')
    })

    it('should prioritize ** over __ when both are unclosed', () => {
      // When both ** and __ are unclosed, ** should be completed first
      expect(fixStrong('**asterisk and __underscore')).toBe('**asterisk and __underscore**')
    })

    it('should handle mixed strong and emphasis correctly', () => {
      expect(fixStrong('**bold** and _italic_ and __strong')).toBe('**bold** and _italic_ and __strong__')
      expect(fixStrong('__strong__ and *italic* and **bold')).toBe('__strong__ and *italic* and **bold**')
    })

    it('should complete ** when mixed with unclosed *', () => {
      expect(fixStrong('**bold and *mixed')).toBe('**bold and *mixed**')
    })
  })
})
