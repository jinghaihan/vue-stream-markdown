export const crlfPattern = /\r\n?/g

export const trailingBackticksPattern = /(`+)\s*$/
export const codeBlockPattern = /```[\s\S]*?```/g
export const inlineCodePattern = /`[^`\n]+`/g
export const trailingWhitespacePattern = /\s+$/

export const doubleAsteriskPattern = /\*\*/g
export const singleAsteriskPattern = /\*/g
export const doubleUnderscorePattern = /__/g
export const singleUnderscorePattern = /_/g

export const doubleTildePattern = /~~/g
export const singleDollarPattern = /\$/g
export const doubleDollarPattern = /\$\$/g
export const inlineBracketMathPattern = /\\\[(.*?)\\\]/g
export const blockBracketMathPattern = /\\\[([\s\S]*?)\\\]/g
export const parenMathPattern = /\\\((.*?)\\\)/g
export const inlineDollarMathPattern = /(^|[^\\])\$(.+?)\$/g
export const dollarPlaceholderPattern = /_TMP_REPLACE_DOLLAR_/g

export const incompleteBracketPattern = /!?\[[^\]]*$/
export const incompleteLinkTextPattern = /!?\[[^\]]*\]\s*$/
export const incompleteFootnoteRefPattern = /\[\^[^\]]*$/
export const standaloneBracketPattern = /(!?\[)\s*$/

/** Footnote patterns */
export const footnoteDefPattern = /\[\^[^\]]+\]:/g
export const footnoteRefPattern = /\[\^[^\]]+\]/g
export const footnoteDefLinePattern = /^\s*\[\^[^\]]+\]:/
export const footnoteDefLabelPattern = /\[\^([^\]]+)\]:/
export const footnoteRefLabelPattern = /\[\^([^\]]+)\]/

export const tableRowPattern = /^\|.*\|.*\|/
export const separatorPattern = /^\|[\s:]*-{3,}[\s:]*(?:\|[\s:]*-{3,}[\s:]*)+\|?$/

/** Match standalone `-` without trailing space (to distinguish from regular list items like `- `) */
/** Match incomplete task list item `- [` or `-[` (with optional space between - and [, and optional trailing whitespace) */
export const incompleteTaskListPattern = /^\s*-\s*\[\s*$/
/** Match standalone `> -` without trailing space */
/** Match incomplete task list item in quote block `> - [` or `> -[` (with optional space between - and [, and optional trailing whitespace) */
export const quoteIncompleteTaskListPattern = /^>\s*-\s*\[\s*$/

/**
 * Match trailing standalone dash with optional whitespace (used to clean up after removing ** or *)
 * Captures the preceding newlines to preserve them
 */
export const trailingStandaloneDashWithNewlinesPattern = /(\n\n?)-[ \t]*$/

/**
 * URL patterns - used to exclude URL content from markdown syntax counting
 * Match link/image URL: [text](url) or ![alt](url)
 * This matches the entire link/image syntax including the URL part
 */
export const linkImagePattern = /!?\[[^\]]*\]\([^)]*\)/g
export const linkImageUrlSuffixPattern = /\]\([^)]*\)/
/**
 * Match incomplete link/image URL: [text](url or ![alt](url
 * This matches incomplete links/images where the URL is not closed
 */
export const incompleteLinkImageUrlPattern = /!?\[[^\]]*\]\([^)]*$/g
export const incompleteLinkImageUrlSuffixPattern = /\]\([^)]*$/
/**
 * Match standalone URL (not part of markdown link syntax)
 * Matches http:// or https:// URLs that are not part of ](url) pattern
 */
export const standaloneUrlPattern = /https?:\/\/[^\s<>)]+/gi
export const htmlTagPattern = /<[^>]*>/g
export const htmlCommentStartPattern = /^<!--[\s\S]*$/
export const htmlDoctypePattern = /^<![A-Z][^>]*$/i
export const htmlProcessingInstructionPattern = /^<\?[\s\S]*$/
export const htmlClosingTagPattern = /^<\/[A-Z][\w-]*\s*$/i
export const htmlOpeningTagPattern = /^<[A-Z][\w-]*(?:\s[^<>]*)?$/i
export const optionalTrailingWhitespacePattern = /\s*$/
export const trailingLineWhitespacePattern = /[ \t]+$/

export const listComparisonPattern = /^(\s*(?:[-*+]|\d+[.)])[ \t]+)>(=?[ \t]*\$?\d)/gm
export const unicodeWordCharacterPattern = /[\p{L}\p{N}\p{M}]/u
export const whitespaceCharacterPattern = /\s/
export const whitespaceSequencePattern = /\s+/
export const whitespaceGlobalPattern = /\s/g
export const leadingSpacesPattern = /^ */
export const horizontalWhitespaceGlobalPattern = /[ \t]/g
export const thematicBreakPattern = /^(?:\*{3,}|_{3,}|-{3,})$/
export const thematicBreakMarkerPattern = /[*_-]/g
export const htmlTagInitialPattern = /[a-z!?]/i
export const htmlTagNameInitialPattern = /[a-z]/i
export const orderedListItemPattern = /^\d+[.)][ \t]/
