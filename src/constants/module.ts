import { devDependencies } from '../../package.json'

const versionRegex = /^\^/

function cleanupVersion(version: string) {
  return version.replace(versionRegex, '')
}

export const KATEX_VERSION = cleanupVersion(devDependencies.katex)

export const MERMAID_VERSION = cleanupVersion(devDependencies.mermaid)

export const SHIKI_VERSION = cleanupVersion(devDependencies.shiki)
