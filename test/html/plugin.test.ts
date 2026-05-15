import {
  createHtmlPlugin,
  parseHtml,
  sanitizeHtml,
  transformHtml,
} from '@stream-markdown/html'
import { describe, expect, it } from 'vitest'

describe('@stream-markdown/html', () => {
  it('sanitizes and parses allowed custom tags', () => {
    const nodes = transformHtml('<div><GitHub name="vue-stream-markdown" description="Streaming" onclick="alert(1)">Open</div>', {
      componentTags: ['github'],
      allowedAttributes: {
        github: ['name', 'description'],
      },
    })

    expect(nodes).toEqual([
      {
        type: 'element',
        tag: 'div',
        attrs: {},
        children: [
          {
            type: 'element',
            tag: 'github',
            attrs: {
              name: 'vue-stream-markdown',
              description: 'Streaming',
            },
            children: [
              {
                type: 'text',
                value: 'Open',
              },
            ],
          },
        ],
      },
    ])
  })

  it('keeps safe native html by default', () => {
    expect(transformHtml('<div>Open</div> plain')).toEqual([
      {
        type: 'element',
        tag: 'div',
        attrs: {},
        children: [
          {
            type: 'text',
            value: 'Open',
          },
        ],
      },
      {
        type: 'text',
        value: ' plain',
      },
    ])
  })

  it('drops unsafe urls from allowed attributes', () => {
    const nodes = transformHtml('<card href="javascript:alert(1)" src="https://example.com/image.png" title="ok" />', {
      componentTags: ['card'],
      allowedAttributes: {
        card: ['href', 'src', 'title'],
      },
    })

    expect(nodes).toEqual([
      {
        type: 'element',
        tag: 'card',
        attrs: {
          src: 'https://example.com/image.png',
          title: 'ok',
        },
        children: [],
      },
    ])
  })

  it('supports plugin instances', () => {
    const html = createHtmlPlugin({
      componentTags: ['alert'],
      allowedAttributes: ['type'],
    })

    expect(html.sanitize('<alert type="info" data-x="1">Heads up</alert>')).toBe('<alert type="info">Heads up</alert>')
    expect(html.parse('<alert type="info">Heads up</alert>')).toEqual([
      {
        type: 'element',
        tag: 'alert',
        attrs: {
          type: 'info',
        },
        children: [
          {
            type: 'text',
            value: 'Heads up',
          },
        ],
      },
    ])
    expect(html.transform('<alert type="info" data-x="1">Heads up</alert>')).toEqual([
      {
        type: 'element',
        tag: 'alert',
        attrs: {
          type: 'info',
        },
        children: [
          {
            type: 'text',
            value: 'Heads up',
          },
        ],
      },
    ])
  })

  it('normalizes self-closing custom tags before parsing', () => {
    expect(transformHtml('<badge value="1" /> after', {
      componentTags: ['badge'],
      allowedAttributes: {
        badge: ['value'],
      },
    })).toEqual([
      {
        type: 'element',
        tag: 'badge',
        attrs: {
          value: '1',
        },
        children: [],
      },
      {
        type: 'text',
        value: ' after',
      },
    ])
  })

  it('keeps parseHtml available for already sanitized html', () => {
    expect(parseHtml('before <badge value="1" /> after', {
      selfClosingTags: ['badge'],
    })).toEqual([
      {
        type: 'text',
        value: 'before ',
      },
      {
        type: 'element',
        tag: 'badge',
        attrs: {
          value: '1',
        },
        children: [],
      },
      {
        type: 'text',
        value: ' after',
      },
    ])
  })

  it('keeps sanitizeHtml available for advanced composition', () => {
    expect(sanitizeHtml('<script>alert(1)</script><x-safe>ok</x-safe>', {
      allowedTags: ['x-safe'],
    })).toBe('<x-safe>ok</x-safe>')
  })
})
