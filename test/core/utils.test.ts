import {
  createTextParts,
  detectTextDirection,
  getConfigValue,
  getDownloadFilename,
  getTableCellNodes,
  getTransitionName,
  isConfigEnabled,
  normalizeAnimationDuration,
  normalizeCssSize,
  normalizeThemeVariableValue,
  resolveScrollableMaxHeight,
  resolveTableAlign,
  resolveTextAnimationSplit,
  resolveTextDirection,
  splitText,
  splitTextByAuto,
  splitTextByChar,
  splitTextByWord,
  STREAM_MARKDOWN_CSS_VARIABLES,
} from '@stream-markdown/core'
import { describe, expect, it } from 'vitest'

describe('core utilities', () => {
  it('splits text into word and whitespace parts with stable offsets', () => {
    expect(splitTextByWord('Hello  world')).toEqual(['Hello', '  ', 'world'])
    expect(createTextParts('Hello  world', 'node-key')).toEqual([
      { key: 'node-key-0', value: 'Hello', whitespace: false, animationSplit: 'word' },
      { key: 'node-key-5', value: '  ', whitespace: true, animationSplit: 'word' },
      { key: 'node-key-7', value: 'world', whitespace: false, animationSplit: 'word' },
    ])
  })

  it('splits text into character parts while preserving whitespace runs', () => {
    expect(splitTextByChar('你好  world')).toEqual(['你', '好', '  ', 'w', 'o', 'r', 'l', 'd'])
    expect(splitText('日本語\ntext', 'char')).toEqual(['日', '本', '語', '\n', 't', 'e', 'x', 't'])
    expect(createTextParts('你好 world', 'node-key', 'char')).toEqual([
      { key: 'node-key-0', value: '你', whitespace: false, animationSplit: 'char' },
      { key: 'node-key-1', value: '好', whitespace: false, animationSplit: 'char' },
      { key: 'node-key-2', value: ' ', whitespace: true, animationSplit: 'char' },
      { key: 'node-key-3', value: 'w', whitespace: false, animationSplit: 'char' },
      { key: 'node-key-4', value: 'o', whitespace: false, animationSplit: 'char' },
      { key: 'node-key-5', value: 'r', whitespace: false, animationSplit: 'char' },
      { key: 'node-key-6', value: 'l', whitespace: false, animationSplit: 'char' },
      { key: 'node-key-7', value: 'd', whitespace: false, animationSplit: 'char' },
    ])
  })

  it('automatically uses character splitting for CJK text', () => {
    expect(resolveTextAnimationSplit('Hello world')).toBe('word')
    expect(resolveTextAnimationSplit('你好 world')).toBe('char')
    expect(splitTextByAuto('你好 world')).toEqual(['你', '好', ' ', 'world'])
    expect(splitText('你好 world')).toEqual(['你', '好', ' ', 'world'])
    expect(createTextParts('你好 world', 'node-key')).toEqual([
      { key: 'node-key-0', value: '你', whitespace: false, animationSplit: 'char' },
      { key: 'node-key-1', value: '好', whitespace: false, animationSplit: 'char' },
      { key: 'node-key-2', value: ' ', whitespace: true, animationSplit: 'word' },
      { key: 'node-key-3', value: 'world', whitespace: false, animationSplit: 'word' },
    ])
  })

  it('resolves animation names', () => {
    expect(getTransitionName('fade-in')).toBe('stream-markdown-fade-in')
  })

  it('normalizes CSS values used by renderers', () => {
    expect(STREAM_MARKDOWN_CSS_VARIABLES.animationDuration).toBe('--stream-markdown-animation-duration')
    expect(normalizeAnimationDuration(500)).toBe('500ms')
    expect(normalizeAnimationDuration('0.2s')).toBe('0.2s')
    expect(normalizeAnimationDuration(undefined)).toBeUndefined()
    expect(normalizeCssSize(320)).toBe('320px')
    expect(normalizeCssSize('60vh')).toBe('60vh')
    expect(resolveScrollableMaxHeight(320)).toBe('320px')
    expect(resolveScrollableMaxHeight('50vh')).toBe('50vh')
    expect(resolveScrollableMaxHeight(0)).toBeUndefined()
    expect(resolveScrollableMaxHeight(Number.POSITIVE_INFINITY)).toBeUndefined()
    expect(resolveScrollableMaxHeight('none')).toBeUndefined()
  })

  it('wraps bare hsl channels and leaves resolved theme colors untouched', () => {
    expect(normalizeThemeVariableValue('30 29% 95%')).toBe('hsl(30 29% 95%)')
    expect(normalizeThemeVariableValue(' 0 0% 100% ')).toBe('hsl(0 0% 100%)')
    expect(normalizeThemeVariableValue('#fff')).toBeUndefined()
    expect(normalizeThemeVariableValue('#f5f1ed')).toBeUndefined()
    expect(normalizeThemeVariableValue('hsl(30 29% 95%)')).toBeUndefined()
    expect(normalizeThemeVariableValue('rgb(245 241 237)')).toBeUndefined()
    expect(normalizeThemeVariableValue('oklch(0.96 0.01 70)')).toBeUndefined()
    expect(normalizeThemeVariableValue('')).toBeUndefined()
  })

  it('resolves table alignment and unwraps table cell children', () => {
    expect(resolveTableAlign(['center'], 0)).toBe('center')
    expect(resolveTableAlign(['center'], 1)).toBe('left')

    const child = { type: 'text', value: 'A' }
    expect(getTableCellNodes({ children: [child] })).toEqual([child])
    expect(getTableCellNodes(child)).toEqual([child])
  })

  it('resolves custom download filenames with safe fallbacks', () => {
    const controls = {
      code: { download: { filename: 'myScript' } },
      table: { download: { filename: 'report' } },
      mermaid: { download: { filename: 'flowchart' } },
    }

    expect(getDownloadFilename(controls, 'code', 'file')).toBe('myScript')
    expect(getDownloadFilename(controls, 'table', 'table')).toBe('report')
    expect(getDownloadFilename(controls, 'mermaid', 'diagram')).toBe('flowchart')
    expect(getDownloadFilename({ code: { download: true } }, 'code', 'file')).toBe('file')
    expect(getDownloadFilename({ code: { download: { filename: '' } } }, 'code', 'file')).toBe('file')
    expect(getDownloadFilename(false, 'code', 'file')).toBe('file')
  })

  it('inherits boolean control values from parent groups', () => {
    const disabled = {
      code: false,
      image: false,
      mermaid: false,
      table: false,
    }

    expect(getConfigValue(disabled, 'code.copy')).toBe(false)
    expect(getConfigValue(disabled, 'table.download')).toBe(false)
    expect(isConfigEnabled(disabled, 'image.preview')).toBe(false)
    expect(isConfigEnabled(disabled, 'mermaid.download')).toBe(false)

    expect(getConfigValue({ code: true }, 'code.copy')).toBe(true)
    expect(isConfigEnabled({ code: { copy: false } }, 'code.copy')).toBe(false)
    expect(isConfigEnabled({ code: {} }, 'code.copy')).toBe(true)
  })

  it('detects text direction by strong-character majority with stable tie-breaking', () => {
    expect(detectTextDirection('Hello world')).toBe('ltr')
    expect(detectTextDirection('مرحبا بالعالم')).toBe('rtl')
    expect(detectTextDirection('React یک کتابخانه جاوااسکریپت بسیار محبوب است.')).toBe('rtl')
    expect(detectTextDirection('abc אבג')).toBe('ltr')
    expect(detectTextDirection('אבג abc')).toBe('rtl')
    expect(detectTextDirection('1234 !?')).toBe('ltr')
  })

  it('resolves text direction from visible text', () => {
    expect(resolveTextDirection('این یک نمونه است.', 'auto')).toBe('rtl')
    expect(resolveTextDirection('این یک نمونه است.', 'ltr')).toBe('ltr')
    expect(resolveTextDirection('این یک نمونه است.', undefined)).toBeUndefined()
  })
})
