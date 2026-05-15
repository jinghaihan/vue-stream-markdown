import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readmePath = resolve(rootDir, 'README.md')
const packages = [
  resolve(rootDir, 'packages/core'),
  resolve(rootDir, 'packages/extensions/code'),
  resolve(rootDir, 'packages/extensions/html'),
  resolve(rootDir, 'packages/extensions/math'),
  resolve(rootDir, 'packages/extensions/mermaid'),
  resolve(rootDir, 'packages/markmend/core'),
  resolve(rootDir, 'packages/markmend/ast'),
  resolve(rootDir, 'packages/vue'),
]

async function syncReadme(packageDir: string, readme: string) {
  await mkdir(packageDir, { recursive: true })
  await writeFile(resolve(packageDir, 'README.md'), readme)
}

async function runPrepack() {
  const readme = await readFile(readmePath, 'utf8')
  for (const packageDir of packages)
    await syncReadme(packageDir, readme)
}
runPrepack()
