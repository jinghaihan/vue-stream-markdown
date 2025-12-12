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
export const incompleteFootnoteRefPattern = /\[\^[^\]]*$/
export const trailingStandaloneBracketPattern = /(!?\[)\s*$/

// Footnote patterns
export const footnoteDefPattern = /\[\^[^\]]+\]:/g
export const footnoteRefPattern = /\[\^[^\]]+\]/g
export const footnoteDefLinePattern = /^\s*\[\^[^\]]+\]:/
export const footnoteDefLabelPattern = /\[\^([^\]]+)\]:/
export const footnoteRefLabelPattern = /\[\^([^\]]+)\]/

export const tableRowPattern = /^\|.*\|.*\|/
export const separatorPattern = /^\|[\s:]*-{3,}[\s:]*(?:\|[\s:]*-{3,}[\s:]*)+\|?$/

// Match standalone `-` without trailing space (to distinguish from regular list items like `- `)
export const standaloneDashPattern = /^\s*-$/
export const taskListPattern = /^\s*- \[[x ]\]/i
// Match standalone `> -` without trailing space
export const quoteStandaloneDashPattern = /^>\s*-$/
export const quoteTaskListPattern = /^>\s*- \[[x ]\]/i
