import { describe, expect, it } from 'vitest'
import { transformUrl } from '../../packages/core/src/utils/harden'

describe('transformUrl', () => {
  const defaults = {
    allowedPrefixes: ['https://example.com/docs/'],
    defaultOrigin: 'https://example.com',
  }

  it('rejects missing and non-string URLs', () => {
    expect(transformUrl('', [], '')).toBeNull()
    expect(transformUrl(null, [], '')).toBeNull()
    expect(transformUrl(42, [], '')).toBeNull()
  })

  it('preserves safe hash links but not image hashes', () => {
    expect(transformUrl('#section', [], '')).toBe('#section')
    expect(transformUrl('#section', [], '', false, true)).toBeNull()
  })

  it('allows data images only when explicitly enabled', () => {
    const image = 'data:image/png;base64,abc'
    expect(transformUrl(image, [], '', true, true)).toBe(image)
    expect(transformUrl(image, [], '', false, true)).toBeNull()
    expect(transformUrl('data:text/plain,hello', [], '', true, true)).toBeNull()
  })

  it('validates blob URLs', () => {
    expect(transformUrl('blob:https://example.com/id', [], '')).toBe('blob:https://example.com/id')
    expect(transformUrl('blob:invalid', [], '')).toBeNull()
  })

  it('rejects blocked or unknown protocols', () => {
    expect(transformUrl('javascript:alert(1)', ['*'], '')).toBeNull()
    expect(transformUrl('file:///tmp/file', ['*'], '')).toBeNull()
    expect(transformUrl('custom:value', ['*'], '', false, false, ['custom:'])).toBe('custom:value')
  })

  it('enforces allowed HTTP prefixes and preserves relative URLs', () => {
    expect(transformUrl('/docs/guide', defaults.allowedPrefixes, defaults.defaultOrigin)).toBe('/docs/guide')
    expect(transformUrl('https://example.com/docs/guide', defaults.allowedPrefixes, defaults.defaultOrigin))
      .toBe('https://example.com/docs/guide')
    expect(transformUrl('/private', defaults.allowedPrefixes, defaults.defaultOrigin)).toBeNull()
    expect(transformUrl('https://other.test/docs/guide', defaults.allowedPrefixes, defaults.defaultOrigin)).toBeNull()
  })

  it('supports the HTTP wildcard', () => {
    expect(transformUrl('/anywhere?q=1#top', ['*'], defaults.defaultOrigin)).toBe('/anywhere?q=1#top')
    expect(transformUrl('https://other.test/page', ['*'], defaults.defaultOrigin)).toBe('https://other.test/page')
    expect(transformUrl('ftp://other.test/file', ['*'], defaults.defaultOrigin)).toBeNull()
  })

  it('returns non-HTTP safe protocols as normalized URLs', () => {
    expect(transformUrl('mailto:user@example.com', [], '')).toBe('mailto:user@example.com')
    expect(transformUrl('irc://irc.example.com/channel', [], '')).toBe('irc://irc.example.com/channel')
  })
})
