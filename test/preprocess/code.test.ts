import { describe, expect, it } from 'vitest'
import { fixCode } from '../../src/preprocess/code'

describe('fixCode', () => {
  describe('inline code', () => {
    it('should complete unclosed ` with content', () => {
      expect(fixCode('Hello `world')).toBe('Hello `world`')
      expect(fixCode('Use `console.log')).toBe('Use `console.log`')
    })

    it('should not modify already closed `', () => {
      expect(fixCode('Hello `world`')).toBe('Hello `world`')
      expect(fixCode('Use `console.log` for debugging')).toBe('Use `console.log` for debugging')
    })

    it('should remove bare ` without content', () => {
      expect(fixCode('`')).toBe('')
      expect(fixCode('Hello\n\n`')).toBe('Hello')
      expect(fixCode('Text `')).toBe('Text')
    })

    it('should only process last paragraph for inline code', () => {
      expect(fixCode('Para1 `unclosed\n\nPara2 `code')).toBe('Para1 `unclosed\n\nPara2 `code`')
    })

    it('should handle multiple ` in same paragraph', () => {
      expect(fixCode('`a` and `b')).toBe('`a` and `b`')
      expect(fixCode('`a` and `b`')).toBe('`a` and `b`')
    })

    it('should handle ` spanning multiple lines in same paragraph', () => {
      expect(fixCode('Hello `world\nand more code')).toBe('Hello `world\nand more code`')
    })

    it('should not interfere with code blocks when counting inline code', () => {
      expect(fixCode('```js\ncode\n``` and `inline')).toBe('```js\ncode\n``` and `inline`')
    })
  })

  describe('code blocks', () => {
    it('should complete unclosed code block with content', () => {
      expect(fixCode('```javascript\nconst x = 1')).toBe('```javascript\nconst x = 1\n```')
      expect(fixCode('```\ncode here')).toBe('```\ncode here\n```')
    })

    it('should complete code block that already ends with newline', () => {
      expect(fixCode('```python\nprint("hello")\n')).toBe('```python\nprint("hello")\n```')
    })

    it('should not modify already closed code blocks', () => {
      expect(fixCode('```js\ncode\n```')).toBe('```js\ncode\n```')
      expect(fixCode('```javascript\nconst x = 1;\n```')).toBe('```javascript\nconst x = 1;\n```')
    })

    it('should remove bare ``` without content', () => {
      expect(fixCode('```')).toBe('')
      expect(fixCode('Hello\n\n```')).toBe('Hello')
      expect(fixCode('Text ```')).toBe('Text')
    })

    it('should handle code blocks spanning multiple paragraphs', () => {
      const input = '```javascript\nfunction test() {\n\n  return true;\n}'
      const expected = '```javascript\nfunction test() {\n\n  return true;\n}\n```'
      expect(fixCode(input)).toBe(expected)
    })

    it('should handle multiple complete code blocks', () => {
      const input = '```js\ncode1\n```\n\nText\n\n```py\ncode2\n```'
      expect(fixCode(input)).toBe(input)
    })

    it('should complete last code block when multiple blocks exist', () => {
      const input = '```js\ncode1\n```\n\nText\n\n```python\ncode2'
      const expected = '```js\ncode1\n```\n\nText\n\n```python\ncode2\n```'
      expect(fixCode(input)).toBe(expected)
    })

    it('should handle code blocks with language identifiers', () => {
      expect(fixCode('```typescript\ntype Foo = string')).toBe('```typescript\ntype Foo = string\n```')
      expect(fixCode('```bash\necho "hello')).toBe('```bash\necho "hello\n```')
    })

    it('should handle code blocks without language identifiers', () => {
      expect(fixCode('```\nplain code')).toBe('```\nplain code\n```')
    })
  })

  describe('mixed inline code and code blocks', () => {
    it('should handle both inline code and code blocks', () => {
      const input = '```js\ncode\n```\n\nUse `variable'
      const expected = '```js\ncode\n```\n\nUse `variable`'
      expect(fixCode(input)).toBe(expected)
    })

    it('should complete code block before processing inline code', () => {
      const input = 'Text `inline` code\n\n```js\nconst x = 1'
      const expected = 'Text `inline` code\n\n```js\nconst x = 1\n```'
      expect(fixCode(input)).toBe(expected)
    })

    it('should not complete inline code inside complete code blocks', () => {
      const input = '```js\nconst x = `template\n```'
      expect(fixCode(input)).toBe(input)
    })

    it('should handle unclosed code block and then inline code', () => {
      const input = '```python\nprint("test'
      const expected = '```python\nprint("test\n```'
      expect(fixCode(input)).toBe(expected)
    })
  })

  describe('edge cases', () => {
    it('should handle empty content', () => {
      expect(fixCode('')).toBe('')
    })

    it('should handle content with only whitespace', () => {
      expect(fixCode('   ')).toBe('   ')
      expect(fixCode('\n\n')).toBe('\n\n')
    })

    it('should handle multiple unclosed inline codes (only complete the last)', () => {
      expect(fixCode('Para1 `one\n\nPara2 `two')).toBe('Para1 `one\n\nPara2 `two`')
    })

    it('should handle backticks in different contexts', () => {
      expect(fixCode('Text with ` and more')).toBe('Text with ` and more`')
    })

    it('should not be confused by backticks in regular text', () => {
      expect(fixCode('Don\'t use ` as quote')).toBe('Don\'t use ` as quote`')
    })
  })

  describe('trailing incomplete backticks', () => {
    it('should remove trailing single ` without content', () => {
      expect(fixCode('Hello world `')).toBe('Hello world')
      expect(fixCode('Hello world `\n')).toBe('Hello world\n')
    })

    it('should remove trailing `` without content', () => {
      expect(fixCode('Hello world ``')).toBe('Hello world')
      expect(fixCode('Hello world ``\n')).toBe('Hello world\n')
    })

    it('should remove trailing ``` without content', () => {
      expect(fixCode('Hello world ```')).toBe('Hello world')
      expect(fixCode('Hello world ```\n')).toBe('Hello world\n')
    })

    it('should keep closing backticks for inline code', () => {
      expect(fixCode('Hello `world`')).toBe('Hello `world`')
    })

    it('should keep closing backticks for code blocks', () => {
      expect(fixCode('```js\ncode\n```')).toBe('```js\ncode\n```')
    })

    it('should remove trailing backticks in streaming scenarios', () => {
      // Simulating streaming: user types `, then ``, then ```
      expect(fixCode('```js\n\nconsole.log("Hello, world!")\n\n`')).toBe('```js\n\nconsole.log("Hello, world!")')
      expect(fixCode('```js\n\nconsole.log("Hello, world!")\n\n``')).toBe('```js\n\nconsole.log("Hello, world!")')
      expect(fixCode('```js\n\nconsole.log("Hello, world!")\n\n```')).toBe('```js\n\nconsole.log("Hello, world!")\n\n```')
    })

    it('should handle text followed by incomplete backticks', () => {
      expect(fixCode('## Hello, world!\n\nHello, **world**!\n\nfoobar\n\n```js\n\nconsole.log("Hello, world!")\n\n``'))
        .toBe('## Hello, world!\n\nHello, **world**!\n\nfoobar\n\n```js\n\nconsole.log("Hello, world!")')
    })
  })
})
