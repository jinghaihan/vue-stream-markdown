export const crlfPattern = /\r\n?/g

export const trailingBackticksPattern = /(`+)\s*$/
export const codeBlockPattern = /```[\s\S]*?```/g
export const singleBacktickPattern = /`/g
export const tripleBacktickPattern = /```/g
export const trailingWhitespacePattern = /\s+$/

export const doubleAsteriskPattern = /\*\*/g
export const singleAsteriskPattern = /\*/g
export const doubleUnderscorePattern = /__/g
export const singleUnderscorePattern = /_/g

export const doubleTildePattern = /~~/g
export const doubleDollarPattern = /\$\$/g

export const incompleteBracketPattern = /!?\[[^\]]*$/
export const incompleteLinkTextPattern = /!?\[[^\]]+\]\s*$/
export const incompleteUrlPattern = /!?\[[^\]]+\]\([^)]*$/

export const tableRowPattern = /^\|.*\|.*\|/
export const separatorPattern = /^\|[\s:]*-{3,}[\s:]*(?:\|[\s:]*-{3,}[\s:]*)+\|?$/
