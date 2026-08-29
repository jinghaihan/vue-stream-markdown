import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const vuePackageDir = fileURLToPath(new URL('../packages/vue/', import.meta.url))
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

    for (const dependency of optionalDependencies)
      expect(declarations).not.toContain(`'${dependency}'`)
  })
})
