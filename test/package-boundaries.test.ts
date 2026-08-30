import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const vuePackageDir = fileURLToPath(new URL('../packages/vue/', import.meta.url))
const publishedPackageDirs = [
  '../packages/core/',
  '../packages/extensions/beautiful-mermaid/',
  '../packages/extensions/code/',
  '../packages/extensions/math/',
  '../packages/extensions/mermaid/',
  '../packages/markmend/core/',
  '../packages/markmend/parser/',
  '../packages/vue/',
].map(path => fileURLToPath(new URL(path, import.meta.url)))
const optionalDependencies = [
  '@stream-markdown/beautiful-mermaid',
  '@stream-markdown/code',
  '@stream-markdown/math',
  '@stream-markdown/mermaid',
  'beautiful-mermaid',
  'katex',
  'mermaid',
  'shiki',
]

describe('main package boundaries', () => {
  it('does not depend on optional extension packages', async () => {
    const manifest = JSON.parse(
      await readFile(`${vuePackageDir}package.json`, 'utf8'),
    ) as Record<string, Record<string, string> | undefined>

    const declared = {
      ...manifest.dependencies,
      ...manifest.peerDependencies,
    }

    for (const dependency of optionalDependencies)
      expect(declared).not.toHaveProperty(dependency)
  })

  it('does not leak optional provider types from its declarations', async () => {
    const declarations = await readFile(`${vuePackageDir}dist/index.d.ts`, 'utf8')
    const moduleSpecifiers = [
      ...declarations.matchAll(/(?:from\s+|import\s*\()(['"])([^'"]+)\1/g),
    ].map(match => match[2])

    for (const dependency of optionalDependencies)
      expect(moduleSpecifiers).not.toContain(dependency)
  })
})

describe('published package boundaries', () => {
  it('does not expose inlined utilities as runtime dependencies', async () => {
    for (const packageDir of publishedPackageDirs) {
      const manifest = JSON.parse(
        await readFile(`${packageDir}package.json`, 'utf8'),
      ) as { dependencies?: Record<string, string> }

      expect(manifest.dependencies ?? {}).not.toHaveProperty('@antfu/utils')
    }
  })
})
