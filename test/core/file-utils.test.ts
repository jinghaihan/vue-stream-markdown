// @vitest-environment happy-dom
import { serializeSvgForDownload } from '@stream-markdown/core'
import { describe, expect, it } from 'vitest'

const rawBrTagPattern = /<br(?:\s[^/>]*)?>/

describe('serializeSvgForDownload', () => {
  it('serializes HTML-style elements in SVG markup as XML', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><div>Line 1<br>Line 2</div></foreignObject></svg>'

    const serialized = serializeSvgForDownload(svg)

    expect(serialized).toContain('<svg')
    expect(serialized).toContain('Line 1')
    expect(serialized).toContain('Line 2')
    expect(serialized).not.toMatch(rawBrTagPattern)
  })

  it('returns the original string when it does not contain an SVG element', () => {
    const html = '<div>Not an SVG</div>'

    expect(serializeSvgForDownload(html)).toBe(html)
  })
})
