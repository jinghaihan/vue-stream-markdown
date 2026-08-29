import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function getFixturesDir(): string {
  return join(__dirname, '__fixtures__')
}

export function getSnapshotsDir(): string {
  return join(getFixturesDir(), '__snapshots__')
}

export function ensureSnapshotsDir(): void {
  const snapshotsDir = getSnapshotsDir()
  if (!existsSync(snapshotsDir)) {
    mkdirSync(snapshotsDir, { recursive: true })
  }
}

export function getFixtureFiles(): string[] {
  const fixturesDir = getFixturesDir()
  if (!existsSync(fixturesDir)) {
    return []
  }

  return readdirSync(fixturesDir)
    .filter(file => file.endsWith('.md') && !file.startsWith('_'))
}

export function readFixture(file: string): string {
  const fixturesDir = getFixturesDir()
  const filePath = join(fixturesDir, file)
  return readFileSync(filePath, 'utf-8')
}

export function getSnapshotPath(fixtureFile: string): string {
  const snapshotsDir = getSnapshotsDir()
  return join(snapshotsDir, `${fixtureFile}.snap`)
}
