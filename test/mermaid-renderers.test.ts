import { describe, expect, it, vi } from 'vitest'
import { resolveMermaidRendererType } from '../src/composables/mermaid-renderers'

describe('resolveMermaidRendererType', () => {
  it('should use beautiful when renderer is explicitly set to beautiful', async () => {
    const hasBeautifulModule = vi.fn(async () => false)

    const result = await resolveMermaidRendererType(
      { renderer: 'beautiful' },
      undefined,
      hasBeautifulModule,
    )

    expect(result).toBe('beautiful')
    expect(hasBeautifulModule).not.toHaveBeenCalled()
  })

  it('should use vanilla when renderer is explicitly set to vanilla', async () => {
    const hasBeautifulModule = vi.fn(async () => true)

    const result = await resolveMermaidRendererType(
      { renderer: 'vanilla' },
      undefined,
      hasBeautifulModule,
    )

    expect(result).toBe('vanilla')
    expect(hasBeautifulModule).not.toHaveBeenCalled()
  })

  it('should use beautiful when beautiful-mermaid CDN is configured in auto mode', async () => {
    const hasBeautifulModule = vi.fn(async () => false)

    const result = await resolveMermaidRendererType(
      undefined,
      {
        baseUrl: 'https://cdn.jsdelivr.net/npm',
        beautifulMermaid: 'umd',
      },
      hasBeautifulModule,
    )

    expect(result).toBe('beautiful')
    expect(hasBeautifulModule).not.toHaveBeenCalled()
  })

  it('should detect local module in auto mode when CDN is unavailable', async () => {
    const hasBeautifulModule = vi.fn(async () => true)

    const result = await resolveMermaidRendererType(
      undefined,
      undefined,
      hasBeautifulModule,
    )

    expect(result).toBe('beautiful')
    expect(hasBeautifulModule).toHaveBeenCalledTimes(1)
  })

  it('should fallback to vanilla in auto mode when local module is not installed', async () => {
    const hasBeautifulModule = vi.fn(async () => false)

    const result = await resolveMermaidRendererType(
      undefined,
      undefined,
      hasBeautifulModule,
    )

    expect(result).toBe('vanilla')
    expect(hasBeautifulModule).toHaveBeenCalledTimes(1)
  })
})
