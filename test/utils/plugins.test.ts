import type { BuiltinPluginFactory } from '../../src/types'
import { describe, expect, it } from 'vitest'
import { resolveBuiltinExtensions } from '../../src/utils/plugins'

describe('resolveBuiltinExtensions', () => {
  interface TestContext {
    mdastOptions?: { singleDollarTextMath?: boolean }
  }
  interface TestExtension {
    name: string
  }

  const createExtension = (name: string): TestExtension => ({ name })

  it('should resolve all builtin extensions', () => {
    const ctx: TestContext = {}
    const builtins = {
      gfm: () => createExtension('gfm'),
      math: () => createExtension('math'),
    }

    const result = resolveBuiltinExtensions(builtins, ctx)

    expect(result).toHaveLength(2)
    expect(result.map(e => e.name)).toEqual(['gfm', 'math'])
  })

  it('should skip extensions when control is false', () => {
    const ctx: TestContext = {}
    const builtins = {
      gfm: () => createExtension('gfm'),
      math: () => createExtension('math'),
      frontmatter: () => createExtension('frontmatter'),
    }

    const result = resolveBuiltinExtensions(builtins, ctx, {
      math: false,
    })

    expect(result).toHaveLength(2)
    expect(result.map(e => e.name)).toEqual(['gfm', 'frontmatter'])
  })

  it('should replace extension with custom factory', () => {
    const ctx: TestContext = {}
    const builtins = {
      gfm: () => createExtension('gfm'),
      math: () => createExtension('math'),
    }

    const customMath: BuiltinPluginFactory<TestContext, TestExtension> = () => createExtension('custom-math')

    const result = resolveBuiltinExtensions(builtins, ctx, {
      math: customMath,
    })

    expect(result).toHaveLength(2)
    expect(result.map(e => e.name)).toEqual(['gfm', 'custom-math'])
  })

  it('should handle factory returning array', () => {
    const ctx: TestContext = {}
    const builtins = {
      gfm: () => createExtension('gfm'),
      math: () => [createExtension('math'), createExtension('math-extra')],
    }

    const result = resolveBuiltinExtensions(builtins, ctx)

    expect(result).toHaveLength(3)
    expect(result.map(e => e.name)).toEqual(['gfm', 'math', 'math-extra'])
  })

  it('should append extend array', () => {
    const ctx: TestContext = {}
    const builtins = {
      gfm: () => createExtension('gfm'),
    }

    const result = resolveBuiltinExtensions(builtins, ctx, undefined, [
      createExtension('custom1'),
      createExtension('custom2'),
    ])

    expect(result).toHaveLength(3)
    expect(result.map(e => e.name)).toEqual(['gfm', 'custom1', 'custom2'])
  })

  it('should use context in factory', () => {
    const ctx: TestContext = { mdastOptions: { singleDollarTextMath: true } }
    const builtins = {
      math: (ctx: TestContext) => createExtension(
        ctx.mdastOptions?.singleDollarTextMath ? 'math-enabled' : 'math-disabled',
      ),
    }

    const result = resolveBuiltinExtensions(builtins, ctx)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('math-enabled')
  })
})
