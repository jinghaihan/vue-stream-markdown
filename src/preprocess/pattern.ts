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
export const incompleteLinkTextPattern = /!?\[[^\]]*\]\s*$/
export const incompleteUrlPattern = /!?\[[^\]]*\]\([^)]*$/
export const incompleteFootnoteRefPattern = /\[\^[^\]]*$/
export const trailingStandaloneBracketPattern = /(\[)\s*$/

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
// Match incomplete task list item `- [` or `-[` (with optional space between - and [, and optional trailing whitespace)
export const incompleteTaskListPattern = /^\s*-\s*\[\s*$/
// Match standalone `> -` without trailing space
export const quoteStandaloneDashPattern = /^>\s*-$/
export const quoteTaskListPattern = /^>\s*- \[[x ]\]/i
// Match incomplete task list item in quote block `> - [` or `> -[` (with optional space between - and [, and optional trailing whitespace)
export const quoteIncompleteTaskListPattern = /^>\s*-\s*\[\s*$/

// Match trailing standalone dash with optional whitespace (used to clean up after removing ** or *)
// Captures the preceding newlines to preserve them
export const trailingStandaloneDashWithNewlinesPattern = /(\n\n?)-[ \t]*$/

// URL patterns - used to exclude URL content from markdown syntax counting
// Match link/image URL: [text](url) or ![alt](url)
// This matches the entire link/image syntax including the URL part
export const linkImagePattern = /!?\[[^\]]*\]\([^)]*\)/g
// Match incomplete link/image URL: [text](url or ![alt](url
// This matches incomplete links/images where the URL is not closed
export const incompleteLinkImageUrlPattern = /!?\[[^\]]*\]\([^)]*$/g
// Match standalone URL (not part of markdown link syntax)
// Matches http:// or https:// URLs that are not part of ](url) pattern
export const standaloneUrlPattern = /https?:\/\/[^\s<>)]+/gi
