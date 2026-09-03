import type { CompletionContext } from '../types'
import {
  codeBlockPattern,
  horizontalWhitespaceGlobalPattern,
  htmlTagInitialPattern,
  htmlTagNameInitialPattern,
  htmlTagPattern,
  incompleteLinkImageUrlPattern,
  incompleteLinkImageUrlSuffixPattern,
  leadingSpacesPattern,
  linkImagePattern,
  linkImageUrlSuffixPattern,
  standaloneUrlPattern,
  thematicBreakMarkerPattern,
  thematicBreakPattern,
  trailingWhitespacePattern,
  unicodeWordCharacterPattern,
  whitespaceCharacterPattern,
  whitespaceSequencePattern,
} from './pattern'

export interface TextRange {
  start: number
  end: number
}

interface MathDelimiter {
  length: 1 | 2
  closingPos: number
}

interface AsteriskRunAnalysis {
  isInsideWord: boolean
  participates: boolean
}

/**
 * Find the start index of the last paragraph in content
 * A paragraph is defined as content after the last blank line
 *
 * @param lines - Array of lines from content.split('\n')
 * @param skipTrailingEmpty - If true, skip the last element if it's empty (from trailing \n)
 * @returns The start index of the last paragraph
 */
export function findLastParagraphStart(lines: string[], skipTrailingEmpty = false): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    // Handle undefined (shouldn't happen, but be safe)
    if (line === undefined) {
      continue
    }

    // Skip the last element if it's empty (from trailing \n)
    if (skipTrailingEmpty && i === lines.length - 1 && line.trim() === '') {
      continue
    }

    if (line.trim() === '') {
      return i + 1
    }
  }
  return 0
}

/**
 * Get the last paragraph from content
 *
 * @param content - Markdown content
 * @param skipTrailingEmpty - If true, skip trailing empty line when finding paragraph start
 * @returns The last paragraph content
 */
export function getLastParagraph(content: string, skipTrailingEmpty = false): string {
  const lines = content.split('\n')
  const startIndex = findLastParagraphStart(lines, skipTrailingEmpty)
  return lines.slice(startIndex).join('\n')
}

/**
 * Get the last paragraph and its start index
 *
 * @param content - Markdown content
 * @param skipTrailingEmpty - If true, skip trailing empty line when finding paragraph start
 * @returns Object with lastParagraph and startIndex
 */
export function getLastParagraphWithIndex(
  content: string,
  skipTrailingEmpty = false,
): { lastParagraph: string, startIndex: number } {
  const lines = content.split('\n')
  const startIndex = findLastParagraphStart(lines, skipTrailingEmpty)
  return {
    lastParagraph: lines.slice(startIndex).join('\n'),
    startIndex,
  }
}

/**
 * Hide a bare marker when it is the only content in the last paragraph.
 * Returns undefined when the paragraph does not contain one of the markers.
 */
export function hideBareFormattingMarker(
  content: string,
  markers: readonly string[],
  lastParagraph = getLastParagraphWithIndex(content).lastParagraph,
): string | undefined {
  const containsOnlyMarkers = (value: string): boolean => {
    const tokens = value.trim().split(whitespaceSequencePattern)
    if (tokens.length === 0 || !tokens.every(token => markers.includes(token)))
      return false

    return maskThematicBreakMarkers(value) === value
  }

  if (containsOnlyMarkers(lastParagraph))
    return content.slice(0, content.length - lastParagraph.length).trimEnd()

  const lastLineStart = content.lastIndexOf('\n') + 1
  const lastLine = content.slice(lastLineStart)
  const trimmedLastLine = lastLine.trim()
  const separatesListMarker = trimmedLastLine[0] === '-'
    && (trimmedLastLine[1] === ' ' || trimmedLastLine[1] === '\t')
  const listItemContent = separatesListMarker ? trimmedLastLine.slice(2) : undefined
  if (listItemContent !== undefined && containsOnlyMarkers(listItemContent))
    return content.slice(0, lastLineStart)

  return undefined
}

/**
 * Find the index of the last non-empty line
 *
 * @param lines - Array of lines
 * @returns The index of the last non-empty line, or -1 if all lines are empty
 */
export function findLastNonEmptyLineIndex(lines: string[]): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    if (line && line.trim() !== '') {
      return i
    }
  }
  return -1
}

/**
 * Get the last non-empty line
 *
 * @param lines - Array of lines
 * @returns The last non-empty line, or undefined if all lines are empty
 */
export function getLastNonEmptyLine(lines: string[]): string | undefined {
  const index = findLastNonEmptyLineIndex(lines)
  return index >= 0 ? lines[index] : undefined
}

/**
 * Calculate the absolute position in content from a relative position in a paragraph
 *
 * @param paragraphStartIndex - The line index where the paragraph starts
 * @param relativePos - The position relative to the paragraph start
 * @param lines - All lines from content.split('\n')
 * @returns The absolute position in the full content
 */
export function calculateAbsolutePosition(
  paragraphStartIndex: number,
  relativePos: number,
  lines: string[],
): number {
  if (paragraphStartIndex === 0) {
    return relativePos
  }

  const beforeParagraph = lines.slice(0, paragraphStartIndex).join('\n')
  return beforeParagraph.length > 0 ? beforeParagraph.length + 1 + relativePos : relativePos
}

/**
 * Calculate the paragraph offset for absolute position calculations
 *
 * @param paragraphStartIndex - The line index where the paragraph starts
 * @param lines - All lines from content.split('\n')
 * @returns The offset to add to relative positions
 */
export function calculateParagraphOffset(paragraphStartIndex: number, lines: string[]): number {
  if (paragraphStartIndex === 0) {
    return 0
  }

  const beforeParagraph = lines.slice(0, paragraphStartIndex).join('\n')
  return beforeParagraph.length > 0 ? beforeParagraph.length + 1 : 0
}

/**
 * Check if a position is within a code block (between ``` markers)
 *
 * @param text - The text to check
 * @param position - The position to check
 * @returns True if the position is within a code block
 */
export function isWithinCodeBlock(text: string, position: number): boolean {
  let inCodeBlock = false

  for (let i = 0; i < position; i += 1) {
    // Check for triple backticks
    if (text[i] === '`' && text[i + 1] === '`' && text[i + 2] === '`') {
      inCodeBlock = !inCodeBlock
      i += 2 // Skip the next two backticks
    }
  }

  return inCodeBlock
}

/**
 * Check if content is inside an unclosed code block
 * This is equivalent to checking if the end of content is within a code block
 *
 * @param content - The content to check
 * @returns True if content is inside an unclosed code block
 */
export function isInsideUnclosedCodeBlock(content: string): boolean {
  return isWithinCodeBlock(content, content.length)
}

/**
 * Find all closed fenced code block ranges in content.
 * Ranges are [start, end) where end is exclusive.
 */
export function findClosedCodeBlockRanges(content: string): TextRange[] {
  const ranges: TextRange[] = []
  let searchStart = 0

  while (true) {
    const codeBlockStart = content.indexOf('```', searchStart)
    if (codeBlockStart === -1) {
      break
    }

    const codeBlockEnd = content.indexOf('```', codeBlockStart + 3)
    if (codeBlockEnd === -1) {
      break
    }

    ranges.push({ start: codeBlockStart, end: codeBlockEnd + 3 })
    searchStart = codeBlockEnd + 3
  }

  return ranges
}

/**
 * Check whether [start, end) overlaps with any ranges.
 */
export function isRangeOverlappingRanges(start: number, end: number, ranges: TextRange[]): boolean {
  return ranges.some(
    range => (start >= range.start && start < range.end)
      || (end > range.start && end <= range.end)
      || (start < range.start && end > range.end),
  )
}

/**
 * Check whether a position is inside any range.
 */
export function isPositionInRanges(position: number, ranges: TextRange[]): boolean {
  return ranges.some(range => position >= range.start && position < range.end)
}

function isBacktickPartOfTriple(text: string, index: number): boolean {
  const before = text[index - 1] || ''
  const before2 = text[index - 2] || ''
  const after = text[index + 1] || ''
  const after2 = text[index + 2] || ''

  return (before === '`' && before2 === '`')
    || (before === '`' && after === '`')
    || (after === '`' && after2 === '`')
}

/**
 * Find inline code ranges (`...`) that are outside fenced code blocks.
 * Returned ranges are [start, end) where end is exclusive.
 */
export function findInlineCodeRanges(
  content: string,
  codeBlockRanges: TextRange[] = findClosedCodeBlockRanges(content),
): TextRange[] {
  const backtickPositions: number[] = []

  for (let i = 0; i < content.length; i++) {
    if (isPositionInRanges(i, codeBlockRanges)) {
      continue
    }

    if (content[i] !== '`') {
      continue
    }

    if (isEscapedCharacter(content, i)) {
      continue
    }

    if (isBacktickPartOfTriple(content, i)) {
      continue
    }

    backtickPositions.push(i)
  }

  const ranges: TextRange[] = []
  for (let i = 0; i < backtickPositions.length; i += 2) {
    const start = backtickPositions[i]
    const end = backtickPositions[i + 1]
    if (start !== undefined && end !== undefined) {
      ranges.push({ start, end: end + 1 })
    }
  }

  return ranges
}

/**
 * Mask Markdown marker characters inside inline code while preserving all
 * other characters and the original string offsets.
 */
export function maskInlineCodeMarkdownMarkers(
  content: string,
  inlineCodeRanges: TextRange[] = findInlineCodeRanges(content),
): string {
  if (!inlineCodeRanges.length)
    return content

  const characters = content.split('')
  for (const range of inlineCodeRanges) {
    for (let index = range.start; index < range.end; index++) {
      const character = characters[index]
      if (character === '*' || character === '_' || character === '~')
        characters[index] = ' '
    }
  }

  return characters.join('')
}

function isUnicodeWordCharacterAt(content: string, index: number): boolean {
  if (index < 0 || index >= content.length)
    return false

  let characterIndex = index
  const characterCode = content.charCodeAt(characterIndex)
  // If the position points to the low surrogate of a supplementary
  // character, move to the code point's starting position.
  if (characterCode >= 0xDC00 && characterCode <= 0xDFFF)
    characterIndex -= 1

  const codePoint = content.codePointAt(characterIndex)
  return codePoint !== undefined
    && unicodeWordCharacterPattern.test(String.fromCodePoint(codePoint))
}

/**
 * Check whether a character is escaped by an odd number of backslashes.
 */
export function isEscapedCharacter(content: string, index: number): boolean {
  let backslashCount = 0
  for (let i = index - 1; i >= 0 && content[i] === '\\'; i -= 1)
    backslashCount += 1

  return backslashCount % 2 === 1
}

function isWhitespaceOrBoundary(content: string, index: number): boolean {
  return index < 0 || index >= content.length || whitespaceCharacterPattern.test(content[index] ?? '')
}

/**
 * Mask thematic-break marker characters while preserving string offsets.
 * A thematic break may contain spaces between at least three identical
 * `*`, `_`, or `-` markers and up to three leading spaces.
 */
export function maskThematicBreakMarkers(content: string): string {
  if (!content.includes('*') && !content.includes('_') && !content.includes('-'))
    return content

  return content.split('\n').map((line) => {
    const leadingWhitespace = line.match(leadingSpacesPattern)?.[0].length ?? 0
    if (leadingWhitespace > 3)
      return line

    const compact = line.slice(leadingWhitespace).replace(horizontalWhitespaceGlobalPattern, '')
    if (!thematicBreakPattern.test(compact))
      return line

    return line.replace(thematicBreakMarkerPattern, ' ')
  }).join('\n')
}

/**
 * Mask asterisk runs that clearly cannot act as emphasis delimiters.
 */
export function maskInvalidAsteriskMarkers(content: string): string {
  if (!content.includes('*'))
    return content

  let characters: string[] | undefined
  let singleAsteriskCount = 0
  let inWordAsteriskChain = false

  for (let index = 0; index < content.length;) {
    if (content[index] !== '*') {
      if (!isUnicodeWordCharacterAt(content, index))
        inWordAsteriskChain = false
      index += 1
      continue
    }

    const runStart = index
    index = findAsteriskRunEnd(content, index)

    if (shouldMaskAsteriskRun(content, runStart, index)) {
      characters = maskCharacterRange(content, characters, runStart, index)
      continue
    }

    // Paired markers in the run belong to strong emphasis. Only decide whether
    // the odd leftover marker participates in single-asterisk emphasis.
    if ((index - runStart) % 2 === 0)
      continue

    const singleMarkerIndex = index - 1
    const analysis = analyzeAsteriskRun(content, runStart, index, singleAsteriskCount, inWordAsteriskChain)

    if (analysis.participates) {
      singleAsteriskCount += 1
      inWordAsteriskChain = analysis.isInsideWord
    }
    else {
      characters = maskCharacterRange(content, characters, singleMarkerIndex, index)
    }
  }

  return characters?.join('') ?? content
}

function findAsteriskRunEnd(content: string, start: number): number {
  let end = start
  while (end < content.length && content[end] === '*')
    end += 1
  return end
}

function shouldMaskAsteriskRun(content: string, start: number, end: number): boolean {
  return isEscapedCharacter(content, start)
    || (isWhitespaceOrBoundary(content, start - 1)
      && isWhitespaceOrBoundary(content, end))
}

function analyzeAsteriskRun(
  content: string,
  start: number,
  end: number,
  singleAsteriskCount: number,
  inWordAsteriskChain: boolean,
): AsteriskRunAnalysis {
  const isInsideWord = isUnicodeWordCharacterAt(content, start - 1)
    && isUnicodeWordCharacterAt(content, end)
  const canOpen = !isWhitespaceOrBoundary(content, end)
  const canClose = !isWhitespaceOrBoundary(content, start - 1)
  const startsColdInsideWord = isInsideWord
    && singleAsteriskCount % 2 === 0
    && !inWordAsteriskChain

  return {
    isInsideWord,
    participates: !startsColdInsideWord
      && ((canClose && singleAsteriskCount % 2 === 1) || canOpen),
  }
}

function maskCharacterRange(
  content: string,
  characters: string[] | undefined,
  start: number,
  end: number,
): string[] {
  const maskedCharacters = characters ?? content.split('')
  for (let index = start; index < end; index += 1)
    maskedCharacters[index] = ' '
  return maskedCharacters
}

/** Mask escaped Markdown markers while preserving string offsets. */
export function maskEscapedMarkdownMarkers(content: string, markers: string): string {
  const characters = content.split('')
  for (let index = 0; index < content.length; index += 1) {
    if (markers.includes(content[index] ?? '') && isEscapedCharacter(content, index))
      characters[index] = ' '
  }
  return characters.join('')
}

/**
 * Mask complete pairs in delimiter runs, leaving one marker for odd runs.
 * This preserves offsets so a remaining marker can be mapped back to source.
 */
export function maskPairedMarkerRuns(content: string, marker: '*' | '_'): string {
  if (!content.includes(marker))
    return content

  const characters = content.split('')

  for (let index = 0; index < content.length;) {
    if (content[index] !== marker) {
      index += 1
      continue
    }

    const runStart = index
    while (index < content.length && content[index] === marker)
      index += 1

    const markerToKeep = (index - runStart) % 2 === 1 ? index - 1 : -1
    for (let markerIndex = runStart; markerIndex < index; markerIndex += 1) {
      if (markerIndex !== markerToKeep)
        characters[markerIndex] = ' '
    }
  }

  return characters.join('')
}

/**
 * Check whether an underscore run is inside a word.
 *
 * CommonMark does not allow underscore emphasis to open or close inside a
 * word. Keeping this check separate lets streaming completion steps use the
 * same rule for both `_` and `__` markers.
 */
export function isUnderscoreInsideWord(
  content: string,
  start: number,
  length = 1,
): boolean {
  return isUnicodeWordCharacterAt(content, start - 1)
    && isUnicodeWordCharacterAt(content, start + length)
}

/**
 * Check whether an underscore run should be ignored as an emphasis marker.
 */
export function shouldIgnoreUnderscoreMarker(
  content: string,
  start: number,
  length = 1,
): boolean {
  return isEscapedCharacter(content, start)
    || isUnderscoreInsideWord(content, start, length)
    || (isWhitespaceOrBoundary(content, start - 1)
      && isWhitespaceOrBoundary(content, start + length))
}

/**
 * Mask escaped and intraword underscore runs while preserving string offsets.
 */
export function maskInvalidUnderscoreMarkers(content: string): string {
  if (!content.includes('_'))
    return content

  let characters: string[] | undefined

  for (let index = 0; index < content.length;) {
    if (content[index] !== '_') {
      index += 1
      continue
    }

    const runStart = index
    while (index < content.length && content[index] === '_')
      index += 1

    const runLength = index - runStart
    if (shouldIgnoreUnderscoreMarker(content, runStart, runLength)) {
      characters ??= content.split('')
      for (let markerIndex = runStart; markerIndex < index; markerIndex += 1)
        characters[markerIndex] = ' '
    }
  }

  return characters?.join('') ?? content
}

/**
 * Check if a position is within a math block (between $ or $$ delimiters)
 *
 * Note: we intentionally ignore single `$` here so that currency values
 * like `$7,000` do not toggle "math mode" and accidentally suppress
 * other completion steps (e.g. strong/emphasis completion) later in the
 * document. All math-related features in this project use `$$` as the
 * delimiter (see math/inline-math tests), so this behavior is safe.
 *
 * @param text - The text to check
 * @param position - The position to check
 * @returns True if the position is within a math block
 */
export function isWithinMathBlock(
  text: string,
  position: number,
  options?: Pick<CompletionContext, 'singleDollarTextMath'>,
): boolean {
  let inBlockMath = false
  let inInlineMath = false
  const singleDollarEnabled = options?.singleDollarTextMath === true

  for (let i = 0; i < text.length && i < position; i += 1) {
    // Skip escaped dollar signs
    if (text[i] === '\\' && text[i + 1] === '$') {
      i += 1 // Skip the next character
      continue
    }

    // Only treat `$$` as block math delimiters
    if (text[i] === '$' && text[i + 1] === '$') {
      inBlockMath = !inBlockMath
      i += 1 // Skip the second $
      continue
    }

    // Treat single `$` as inline math when enabled
    if (singleDollarEnabled && !inBlockMath && text[i] === '$') {
      inInlineMath = !inInlineMath
    }
  }

  return inBlockMath || inInlineMath
}

/**
 * Check if a position is within a link or image URL
 * Links and images have the format [text](url) or ![alt](url)
 *
 * @param text - The text to check
 * @param position - The position to check
 * @returns True if the position is within a link or image URL
 */
export function isWithinLinkOrImageUrl(
  text: string,
  position: number,
): boolean {
  // Search backwards from position to find if we're inside a (url) part
  for (let i = position - 1; i >= 0; i -= 1) {
    if (text[i] === ')') {
      return false
    }
    if (text[i] === '(') {
      // A newline between `(` and position is handled by the backward scan.
      return i > 0 && text[i - 1] === ']'
    }
    if (text[i] === '\n') {
      return false
    }
  }

  return false
}

/**
 * Check if a position is within an HTML tag (between < and >)
 *
 * @param text - The text to check
 * @param position - The position to check
 * @returns True if the position is within an HTML tag
 */
export function isWithinHtmlTag(text: string, position: number): boolean {
  let inHtmlTag = false

  for (let i = 0; i < position; i += 1) {
    if (text[i] === '<') {
      const nextCharacter = text[i + 1] ?? ''
      const characterAfterSlash = text[i + 2] ?? ''
      const looksLikeTagStart = htmlTagInitialPattern.test(nextCharacter)
        || (nextCharacter === '/' && htmlTagNameInitialPattern.test(characterAfterSlash))

      if (!isEscapedCharacter(text, i) && looksLikeTagStart) {
        inHtmlTag = true
      }
    }
    else if (text[i] === '>' && inHtmlTag && !isEscapedCharacter(text, i)) {
      inHtmlTag = false
    }
  }

  return inHtmlTag
}

/**
 * Remove link/image URLs and HTML tag content from text
 * This is used to exclude URL content from markdown syntax counting
 * (e.g., URLs may contain _, *, ~ which should not be counted as markdown syntax)
 *
 * @param text - The text to process
 * @returns Text with link/image URLs and HTML tags removed (keeping only [text] or ![alt] part)
 */
export function removeUrlsFromText(text: string): string {
  // First, remove code blocks to avoid processing URLs inside them
  const withoutCodeBlocks = text.includes('```')
    ? text.replace(codeBlockPattern, '')
    : text

  // Remove HTML tags (including their attributes which may contain URLs)
  // This handles cases like <file url="http://example.com/path_with_underscore">
  let result = withoutCodeBlocks.includes('<')
    ? withoutCodeBlocks.replace(htmlTagPattern, '')
    : withoutCodeBlocks

  // Remove complete link/image URLs: [text](url) or ![alt](url)
  // Replace the URL part with empty string, keep the [text] or ![alt] part
  if (result.includes('](')) {
    result = result.replace(linkImagePattern, (match) => {
      return match.replace(linkImageUrlSuffixPattern, ']()')
    })

    // Remove incomplete link/image URLs: [text](url or ![alt](url
    // Replace the incomplete URL part with empty string
    result = result.replace(incompleteLinkImageUrlPattern, (match) => {
      return match.replace(incompleteLinkImageUrlSuffixPattern, '](')
    })
  }

  // Remove standalone URLs as their path/query may contain Markdown markers.
  if (result.includes('://'))
    result = result.replace(standaloneUrlPattern, '')

  return result
}

/**
 * Remove math blocks from text (both $$ block math and optionally $ inline math)
 * This is used to exclude math content from markdown syntax counting
 *
 * @param text - The text to process
 * @param options - Options including singleDollarTextMath
 * @returns Text with math blocks removed
 */
export function removeMathBlocksFromText(
  text: string,
  options?: Pick<CompletionContext, 'singleDollarTextMath'>,
): string {
  if (!text.includes('$'))
    return text

  const singleDollarEnabled = options?.singleDollarTextMath === true
  let result = text
  let i = 0

  while (i < result.length) {
    if (isEscapedDollarAt(result, i)) {
      i += 2
      continue
    }

    const delimiter = getMathDelimiterAt(result, i, singleDollarEnabled)
    if (delimiter === undefined) {
      i += 1
      continue
    }

    if (delimiter.closingPos === -1)
      return result.slice(0, i)

    result = result.slice(0, i) + result.slice(delimiter.closingPos + delimiter.length)
  }

  return result
}

function isEscapedDollarAt(text: string, index: number): boolean {
  return text[index] === '\\' && text[index + 1] === '$'
}

function getMathDelimiterAt(
  text: string,
  index: number,
  singleDollarEnabled: boolean,
): MathDelimiter | undefined {
  if (text[index] !== '$')
    return undefined

  if (text[index + 1] === '$') {
    return {
      length: 2,
      closingPos: text.indexOf('$$', index + 2),
    }
  }

  if (!singleDollarEnabled)
    return undefined

  return {
    length: 1,
    closingPos: findUnescapedDollar(text, index + 1),
  }
}

function findUnescapedDollar(text: string, start: number): number {
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === '$' && text[index - 1] !== '\\')
      return index
  }

  return -1
}

/**
 * Append a suffix (e.g. closing ** or __) before any trailing whitespace.
 * This ensures that when users have typed a newline or spaces after their
 * content, we still close the strong markers immediately after the last
 * non-whitespace character instead of placing the markers on a new line.
 *
 * @param content - The original content
 * @param suffix - The suffix to append before trailing whitespace
 * @returns The content with the suffix appended before trailing whitespace
 */
export function appendBeforeTrailingWhitespace(content: string, suffix: string): string {
  const match = content.match(trailingWhitespacePattern)
  const trailing = match ? match[0] : ''
  const withoutTrailing = trailing.length > 0 ? content.slice(0, -trailing.length) : content
  return `${withoutTrailing}${suffix}${trailing}`
}
