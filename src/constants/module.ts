import { peerDependencies } from '../../package.json'

const versionRegex = /^\^/

function cleanupVersion(version: string) {
  return version.replace(versionRegex, '')
}

export const KATEX_VERSION = cleanupVersion(peerDependencies.katex)

export const MERMAID_VERSION = cleanupVersion(peerDependencies.mermaid)

export const SHIKI_VERSION = cleanupVersion(peerDependencies.shiki)
