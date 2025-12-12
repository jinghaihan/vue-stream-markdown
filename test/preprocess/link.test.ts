import { describe, expect, it } from 'vitest'
import { fixLink } from '../../src/preprocess/link'

describe('fixLink', () => {
  describe('incomplete link text', () => {
    it('should complete link with missing closing bracket', () => {
      expect(fixLink('[Google')).toBe('[Google]()')
    })

    it('should complete link with missing closing bracket and content', () => {
      expect(fixLink('Visit [Google')).toBe('Visit [Google]()')
    })
  })

  describe('incomplete URL part', () => {
    it('should complete link with empty URL', () => {
      expect(fixLink('[Google](')).toBe('[Google]()')
    })

    it('should complete link with incomplete URL', () => {
      expect(fixLink('[Google](https://www.goo')).toBe('[Google](https://www.goo)')
    })

    it('should complete link with partial URL', () => {
      expect(fixLink('[Text](http')).toBe('[Text](http)')
    })
  })

  describe('missing URL part entirely', () => {
    it('should add URL part when only text is present', () => {
      expect(fixLink('[Google]')).toBe('[Google]()')
    })

    it('should add URL part with context', () => {
      expect(fixLink('Visit [Google]')).toBe('Visit [Google]()')
    })
  })

  describe('complete links', () => {
    it('should not modify complete links', () => {
      const complete = '[Google](https://www.google.com)'
      expect(fixLink(complete)).toBe(complete)
    })

    it('should not modify links with title', () => {
      const complete = '[Google](https://www.google.com "Search")'
      expect(fixLink(complete)).toBe(complete)
    })

    it('should not modify multiple complete links', () => {
      const complete = '[Google](https://google.com) and [Bing](https://bing.com)'
      expect(fixLink(complete)).toBe(complete)
    })
  })

  describe('images', () => {
    it('should complete image with missing closing bracket', () => {
      expect(fixLink('![alt')).toBe('![alt]()')
    })

    it('should complete image with incomplete URL', () => {
      expect(fixLink('![mdast](https://image.png')).toBe('![mdast](https://image.png)')
    })

    it('should complete image with empty URL', () => {
      expect(fixLink('![alt](')).toBe('![alt]()')
    })

    it('should add URL part for image', () => {
      expect(fixLink('![alt]')).toBe('![alt]()')
    })

    it('should not modify complete images', () => {
      const complete = '![mdast](https://raw.githubusercontent.com/logo.svg)'
      expect(fixLink(complete)).toBe(complete)
    })
  })

  describe('paragraph boundaries', () => {
    it('should only process last paragraph after blank line', () => {
      expect(fixLink('Para1 [unclosed\n\nPara2 [text')).toBe('Para1 [unclosed\n\nPara2 [text]()')
    })

    it('should handle incomplete link in last paragraph', () => {
      expect(fixLink('[Complete](url)\n\n[Incomplete')).toBe('[Complete](url)\n\n[Incomplete]()')
    })

    it('should not complete links in earlier paragraphs', () => {
      expect(fixLink('[First\n\n[Second](url)')).toBe('[First\n\n[Second](url)')
    })
  })

  describe('trailing standalone brackets', () => {
    it('should remove trailing standalone [', () => {
      expect(fixLink('Text [')).toBe('Text ')
    })

    it('should remove trailing standalone ![', () => {
      expect(fixLink('Text ![')).toBe('Text ')
    })

    it('should remove trailing standalone [ with whitespace', () => {
      expect(fixLink('Text [ ')).toBe('Text ')
      expect(fixLink('Text [\n')).toBe('Text ')
    })

    it('should remove trailing standalone ![ with whitespace', () => {
      expect(fixLink('Text ![ ')).toBe('Text ')
      expect(fixLink('Text ![\n')).toBe('Text ')
    })

    it('should remove standalone [ at start of line', () => {
      expect(fixLink('Text\n[')).toBe('Text\n')
      expect(fixLink('Text\n![')).toBe('Text\n')
    })

    it('should remove standalone [ after blank line', () => {
      expect(fixLink('Para1\n\n[')).toBe('Para1\n\n')
      expect(fixLink('Para1\n\n![')).toBe('Para1\n\n')
    })

    it('should not remove [ when it has content', () => {
      expect(fixLink('Text [content')).toBe('Text [content]()')
      expect(fixLink('Text ![alt')).toBe('Text ![alt]()')
    })

    it('should not remove [ when it is part of complete link', () => {
      expect(fixLink('Text [link](url)')).toBe('Text [link](url)')
      expect(fixLink('Text ![alt](url)')).toBe('Text ![alt](url)')
    })

    it('should handle multiple paragraphs with standalone bracket', () => {
      expect(fixLink('Para1 [link](url)\n\nPara2 [')).toBe('Para1 [link](url)\n\nPara2 ')
    })
  })
})
