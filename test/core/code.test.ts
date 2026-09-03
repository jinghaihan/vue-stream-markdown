import { isCodePreviewable } from '@stream-markdown/core'
import { describe, expect, it } from 'vitest'

describe('isCodePreviewable', () => {
  it('disables previews when previewers are explicitly disabled', () => {
    expect(isCodePreviewable({
      previewers: false,
      language: 'mermaid',
      hasMermaid: true,
    })).toBe(false)
  })

  it('waits for non-progressive previews while a node is loading', () => {
    expect(isCodePreviewable({
      previewers: { progressive: { html: false } },
      language: 'html',
      nodeLoading: true,
    })).toBe(false)
  })

  it('enables built-in HTML and Mermaid previews by default', () => {
    expect(isCodePreviewable({ language: 'html' })).toBe(true)
    expect(isCodePreviewable({ language: 'mermaid', hasMermaid: true })).toBe(true)
    expect(isCodePreviewable({ language: 'mermaid', hasMermaid: false })).toBe(false)
    expect(isCodePreviewable({ language: 'typescript' })).toBe(false)
  })

  it('respects built-in preview configuration for object options', () => {
    expect(isCodePreviewable({
      previewers: {},
      language: 'html',
    })).toBe(true)
    expect(isCodePreviewable({
      previewers: { components: { html: false } },
      language: 'html',
    })).toBe(false)
    expect(isCodePreviewable({
      previewers: { components: { mermaid: false } },
      language: 'mermaid',
      hasMermaid: true,
    })).toBe(false)
  })

  it('enables custom preview components only when they can render', () => {
    const component = { name: 'Preview' }

    expect(isCodePreviewable({
      previewers: { components: { json: component } },
      language: 'json',
      progressiveRender: true,
    })).toBe(true)
    expect(isCodePreviewable({
      previewers: { components: { json: component } },
      language: 'json',
      progressiveRender: false,
      nodeLoading: true,
    })).toBe(false)
    expect(isCodePreviewable({
      previewers: { components: { json: true } },
      language: 'json',
      progressiveRender: true,
    })).toBe(false)
  })

  it('uses the custom component predicate when one is provided', () => {
    const component = 'custom-preview'

    expect(isCodePreviewable({
      previewers: { components: { json: component } },
      language: 'json',
      progressiveRender: true,
      isPreviewComponent: value => value === component,
    })).toBe(true)
    expect(isCodePreviewable({
      previewers: { components: { json: component } },
      language: 'json',
      progressiveRender: true,
      isPreviewComponent: () => false,
    })).toBe(false)
  })
})
