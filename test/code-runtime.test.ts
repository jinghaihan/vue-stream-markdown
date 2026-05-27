import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  defaultEngine: { name: 'default-engine' },
  createJavaScriptRegexEngine: vi.fn(),
}))

vi.mock('shiki', () => ({
  createJavaScriptRegexEngine: mocks.createJavaScriptRegexEngine,
}))

describe('resolveShikiEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createJavaScriptRegexEngine.mockReturnValue(mocks.defaultEngine)
  })

  it('uses the JavaScript regex engine by default', async () => {
    const { resolveShikiEngine } = await import('@stream-markdown/code')

    await expect(resolveShikiEngine(undefined)).resolves.toBe(mocks.defaultEngine)
    expect(mocks.createJavaScriptRegexEngine).toHaveBeenCalledWith({ forgiving: true })
  })

  it('uses a custom engine when provided', async () => {
    const { resolveShikiEngine } = await import('@stream-markdown/code')
    const customEngine = { name: 'custom-engine' } as never

    await expect(resolveShikiEngine(customEngine)).resolves.toBe(customEngine)
    expect(mocks.createJavaScriptRegexEngine).not.toHaveBeenCalled()
  })

  it('resolves an async custom engine', async () => {
    const { resolveShikiEngine } = await import('@stream-markdown/code')
    const customEngine = { name: 'async-engine' } as never

    await expect(resolveShikiEngine(Promise.resolve(customEngine))).resolves.toBe(customEngine)
    expect(mocks.createJavaScriptRegexEngine).not.toHaveBeenCalled()
  })
})
