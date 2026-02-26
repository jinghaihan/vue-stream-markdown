import { describe, expect, it } from 'vitest'
import { resolvePurifyConfig, sanitizeHtml } from '../../src/utils/html'

describe('resolvePurifyConfig', () => {
  it('should return empty config when html options are undefined', () => {
    const { config, tagRules } = resolvePurifyConfig()

    expect(config).toEqual({})
    expect(tagRules.size).toBe(0)
  })

  it('should merge allowed tags and attrs into array-based purify config', () => {
    const { config, tagRules } = resolvePurifyConfig({
      allowedTags: [
        { name: 'GitHub-Card', attrs: ['Name', 'Description'] },
        { name: 'x-empty' },
      ],
      purifyConfig: {
        ADD_TAGS: ['trusted-tag'],
        ADD_ATTR: ['id'],
      },
    })

    expect(config.ADD_TAGS).toEqual(['trusted-tag', 'github-card', 'x-empty'])
    expect(config.ADD_ATTR).toEqual(['id', 'name', 'description'])
    expect(tagRules.get('github-card')).toEqual(new Set(['name', 'description']))

    const tagNameCheck = config.CUSTOM_ELEMENT_HANDLING?.tagNameCheck
    if (tagNameCheck instanceof RegExp)
      expect(tagNameCheck.test('github-card')).toBe(true)
    else
      expect(tagNameCheck?.('github-card')).toBe(true)

    const attributeNameCheck = config.CUSTOM_ELEMENT_HANDLING?.attributeNameCheck
    if (attributeNameCheck instanceof RegExp) {
      expect(attributeNameCheck.test('name')).toBe(true)
      expect(attributeNameCheck.test('unknown')).toBe(false)
    }
    else {
      expect(attributeNameCheck?.('name', 'github-card')).toBe(true)
      expect(attributeNameCheck?.('name', 'x-empty')).toBe(false)
    }
  })

  it('should merge with function-based add tag and add attr configs', () => {
    const { config } = resolvePurifyConfig({
      allowedTags: [
        { name: 'x-card', attrs: ['title'] },
      ],
      purifyConfig: {
        ADD_TAGS: (tagName: string) => tagName === 'already-allowed',
        ADD_ATTR: (attrName: string) => attrName === 'already-allowed-attr',
      },
    })

    expect(typeof config.ADD_TAGS).toBe('function')
    expect(typeof config.ADD_ATTR).toBe('function')

    const addTags = config.ADD_TAGS as (tagName: string) => boolean
    const addAttr = config.ADD_ATTR as (attrName: string, tagName: string) => boolean

    expect(addTags('already-allowed')).toBe(true)
    expect(addTags('x-card')).toBe(true)
    expect(addTags('unknown-tag')).toBe(false)

    expect(addAttr('already-allowed-attr', 'div')).toBe(true)
    expect(addAttr('title', 'x-card')).toBe(true)
    expect(addAttr('unknown-attr', 'x-card')).toBe(false)
  })
})

describe('sanitizeHtml', () => {
  it('should return empty string in non-client environment', () => {
    const result = sanitizeHtml('<div>unsafe</div>')
    expect(result).toBe('')
  })
})
