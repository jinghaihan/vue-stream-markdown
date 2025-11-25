import { describe, expect, it } from 'vitest'
import { fixEmphasis } from '../../src/preprocess/emphasis'

describe('fixEmphasis', () => {
  it('should complete unclosed * with content', () => {
    expect(fixEmphasis('Hello *world')).toBe('Hello *world*')
  })

  it('should not modify already closed *', () => {
    expect(fixEmphasis('Hello *world*')).toBe('Hello *world*')
  })

  it('should remove bare * without content', () => {
    expect(fixEmphasis('*')).toBe('')
    expect(fixEmphasis('Hello\n\n*')).toBe('Hello\n\n')
  })

  it('should ignore ** when counting *', () => {
    expect(fixEmphasis('**bold** and *italic')).toBe('**bold** and *italic*')
    expect(fixEmphasis('**bold** *it* **more**')).toBe('**bold** *it* **more**')
  })

  it('should only process last paragraph', () => {
    expect(fixEmphasis('Para1 *unclosed\n\nPara2 *text')).toBe('Para1 *unclosed\n\nPara2 *text*')
  })

  it('should handle multiple * in same paragraph', () => {
    expect(fixEmphasis('*a* and *b')).toBe('*a* and *b*')
    expect(fixEmphasis('*a* and *b*')).toBe('*a* and *b*')
  })

  it('should handle * spanning multiple lines in same paragraph', () => {
    expect(fixEmphasis('Hello *world\nand more text')).toBe('Hello *world\nand more text*')
  })

  // Underscore emphasis tests
  describe('underscore emphasis', () => {
    it('should complete unclosed _ with content', () => {
      expect(fixEmphasis('Hello _world')).toBe('Hello _world_')
    })

    it('should not modify already closed _', () => {
      expect(fixEmphasis('Hello _world_')).toBe('Hello _world_')
    })

    it('should remove bare _ without content', () => {
      expect(fixEmphasis('_')).toBe('')
      expect(fixEmphasis('Hello\n\n_')).toBe('Hello\n\n')
    })

    it('should ignore __ when counting _', () => {
      expect(fixEmphasis('__bold__ and _italic')).toBe('__bold__ and _italic_')
      expect(fixEmphasis('__bold__ _it_ __more__')).toBe('__bold__ _it_ __more__')
    })

    it('should only process last paragraph for _', () => {
      expect(fixEmphasis('Para1 _unclosed\n\nPara2 _text')).toBe('Para1 _unclosed\n\nPara2 _text_')
    })

    it('should handle multiple _ in same paragraph', () => {
      expect(fixEmphasis('_a_ and _b')).toBe('_a_ and _b_')
      expect(fixEmphasis('_a_ and _b_')).toBe('_a_ and _b_')
    })

    it('should handle _ spanning multiple lines in same paragraph', () => {
      expect(fixEmphasis('Hello _world\nand more text')).toBe('Hello _world\nand more text_')
    })

    it('should not interfere with * when using _', () => {
      expect(fixEmphasis('*asterisk* and _underscore')).toBe('*asterisk* and _underscore_')
      expect(fixEmphasis('_underscore_ and *asterisk')).toBe('_underscore_ and *asterisk*')
    })

    it('should prioritize * over _ when both are unclosed', () => {
      // When both * and _ are unclosed, * should be completed first
      expect(fixEmphasis('*asterisk and _underscore')).toBe('*asterisk and _underscore*')
    })
  })
})
