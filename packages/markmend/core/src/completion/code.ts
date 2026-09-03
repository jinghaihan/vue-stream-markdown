import {
  codeBlockPattern,
  trailingBackticksPattern,
  trailingWhitespacePattern,
} from './pattern'
import {
  calculateParagraphOffset,
  getLastParagraphWithIndex,
  isBacktickPartOfTriple,
  isEscapedCharacter,
  isInsideUnclosedCodeBlock,
  isWithinCodeBlock,
} from './utils'

/**
 * Fix unclosed code syntax in streaming markdown
 *
 * Handles two types of code syntax:
 * 1. Inline code: `code` (single backticks)
 * 2. Code blocks: ```language\ncode\n``` (triple backticks)
 *
 * Only processes the last paragraph (content after the last blank line) for inline code.
 * Code blocks can span multiple paragraphs, so they are processed globally.
 *
 * @param content - Markdown content (potentially incomplete in stream mode)
 * @returns Content with auto-completed code syntax if needed
 *
 * @example
 * fixCode('Hello `world')
 * // Returns: 'Hello `world`'
 *
 * @example
 * fixCode('```javascript\nconst x = 1')
 * // Returns: '```javascript\nconst x = 1\n```'
 *
 * @example
 * fixCode('`')
 * // Returns: '' (no completion, ` has no content)
 *
 * @example
 * fixCode('```')
 * // Returns: '```' (no completion, code block has no content)
 */
export function fixCode(content: string): string {
  if (!content.includes('`'))
    return content

  const completedInlineTripleBacktickSpan = completePartialInlineTripleBacktickSpan(content)
  if (completedInlineTripleBacktickSpan !== undefined)
    return completedInlineTripleBacktickSpan

  // Check if we're inside a code block before cleaning
  const isInsideCodeBlock = isInsideUnclosedCodeBlock(content)

  // First, remove trailing incomplete backtick sequences
  // This prevents showing intermediate states like `, ``, or ``` at the end
  const cleaned = removeTrailingIncompleteBackticks(content)
  const wasCleanedUp = cleaned !== content
  content = cleaned

  // Then handle code blocks (triple backticks) - these can span multiple paragraphs
  // If we were inside a code block and cleaned up trailing backticks,
  // we should still complete the code block
  if ((isInsideCodeBlock && wasCleanedUp) || !wasCleanedUp)
    content = fixCodeBlock(content)

  // Finally handle inline code (single backticks) - only in last paragraph
  // But don't process if we just cleaned up (user is still typing)
  if (!wasCleanedUp)
    content = fixInlineCode(content)

  return content
}

/**
 * Complete a same-line triple-backtick code span whose closing run currently
 * contains only one or two backticks. A multiline opener remains a fenced code
 * block and is handled by the existing block completion path.
 */
function completePartialInlineTripleBacktickSpan(content: string): string | undefined {
  const contentWithoutTrailingWhitespace = content.trimEnd()
  let closerStart = contentWithoutTrailingWhitespace.length
  while (closerStart > 0 && contentWithoutTrailingWhitespace[closerStart - 1] === '`')
    closerStart -= 1

  const closerLength = contentWithoutTrailingWhitespace.length - closerStart
  if (closerLength < 1 || closerLength > 2 || isEscapedCharacter(contentWithoutTrailingWhitespace, closerStart))
    return undefined

  const lineStart = contentWithoutTrailingWhitespace.lastIndexOf('\n', closerStart - 1) + 1
  const openerStart = contentWithoutTrailingWhitespace.lastIndexOf('```', closerStart - 1)
  if (openerStart < lineStart
    || isEscapedCharacter(contentWithoutTrailingWhitespace, openerStart)
    || contentWithoutTrailingWhitespace[openerStart - 1] === '`'
    || contentWithoutTrailingWhitespace[openerStart + 3] === '`'
    || openerStart + 3 === closerStart) {
    return undefined
  }

  const trailingWhitespace = content.slice(contentWithoutTrailingWhitespace.length)
  return `${contentWithoutTrailingWhitespace}${'`'.repeat(3 - closerLength)}${trailingWhitespace}`
}

/**
 * Remove trailing incomplete backtick sequences
 * If content ends with `, ``, or ``` (without content after), remove them
 * This prevents showing intermediate states during streaming
 */
function removeTrailingIncompleteBackticks(content: string): string {
  // Check if content ends with backticks (possibly preceded/followed by whitespace)
  const match = content.match(trailingBackticksPattern)

  if (!match || !match[1])
    return content

  const backtickSequence = match[1]
  const backtickPos = content.lastIndexOf(backtickSequence)
  if (isEscapedCharacter(content, backtickPos))
    return content

  const beforeBackticks = content.substring(0, backtickPos)
  const afterBackticks = content.substring(backtickPos + backtickSequence.length)

  // For single backtick `
  if (backtickSequence.length === 1) {
    // Count backticks in the last paragraph before this one
    const { lastParagraph } = getLastParagraphWithIndex(beforeBackticks)

    // Remove code blocks from counting
    const withoutCodeBlocks = lastParagraph.replace(codeBlockPattern, '')

    // Count backticks
    let count = 0
    for (let index = 0; index < withoutCodeBlocks.length; index += 1) {
      if (withoutCodeBlocks[index] === '`' && !isEscapedCharacter(withoutCodeBlocks, index))
        count += 1
    }

    // Check if we're inside a code block
    const isInCodeBlock = isWithinCodeBlock(beforeBackticks, beforeBackticks.length)

    // If odd number of backticks and not in code block, this ` would close inline code, keep it
    if (count % 2 === 1 && !isInCodeBlock)
      return content // Keep it, it's closing inline code

    // Remove the trailing backtick and any trailing spaces on that line
    return beforeBackticks.replace(trailingWhitespacePattern, '') + afterBackticks
  }

  // Keep a triple-backtick sequence when it closes an open code block.
  if (backtickSequence.length === 3
    && isWithinCodeBlock(beforeBackticks, beforeBackticks.length)) {
    return content
  }

  // Double, triple, and longer runs are incomplete unless the triple run
  // above is closing a code block.
  return beforeBackticks.replace(trailingWhitespacePattern, '') + afterBackticks
}

/**
 * Fix unclosed code blocks (```)
 * Code blocks can span multiple paragraphs, so we check the entire content
 */
function fixCodeBlock(content: string): string {
  // If we have an unclosed code block
  if (isInsideUnclosedCodeBlock(content)) {
    const lastFenceIndex = content.lastIndexOf('```')
    const afterFence = content.substring(lastFenceIndex + 3)

    // Check if there's a newline after the opening fence (indicating code content starts)
    // or if there's non-whitespace content (language identifier)
    const hasNewline = afterFence.includes('\n')
    const firstLine = hasNewline ? afterFence.split('\n')[0] ?? '' : afterFence
    const hasLanguage = firstLine.trim().length > 0

    // If there's actual content (language or code after newline), complete the block
    if (hasLanguage || hasNewline) {
      // If content doesn't end with newline, add one before closing fence
      if (!content.endsWith('\n'))
        return `${content}\n\`\`\``

      return `${content}\`\`\``
    }
  }

  return content
}

/**
 * Fix unclosed inline code (`)
 * Only processes the last paragraph (content after the last blank line)
 */
function fixInlineCode(content: string): string {
  // Find the last paragraph
  const lines = content.split('\n')
  const { lastParagraph, startIndex: paragraphStartIndex } = getLastParagraphWithIndex(content)

  // Remove triple backticks (code blocks) and their content to avoid interference
  // We need to remove complete code blocks from counting
  const withoutCodeBlocks = lastParagraph.replace(codeBlockPattern, '')

  const count = countUnescapedBackticks(withoutCodeBlocks)

  if (count % 2 === 0)
    return content

  const lastBacktickPos = findLastUnclosedBacktick(lastParagraph)
  if (lastBacktickPos === -1)
    return content

  const offset = calculateParagraphOffset(paragraphStartIndex, lines)
  const actualPos = offset + lastBacktickPos
  const afterLast = content.substring(actualPos + 1).trim()
  if (afterLast.length > 0)
    return `${content}\``

  return content
}

function countUnescapedBackticks(text: string): number {
  let count = 0
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '`' && !isEscapedCharacter(text, index))
      count += 1
  }
  return count
}

function findLastUnclosedBacktick(text: string): number {
  let lastBacktickPos = -1

  for (let index = 0; index < text.length; index += 1) {
    const codeBlockEnd = findClosedCodeBlockEnd(text, index)
    if (codeBlockEnd !== undefined) {
      index = codeBlockEnd
      continue
    }

    if (text[index] !== '`'
      || isEscapedCharacter(text, index)
      || isBacktickPartOfTriple(text, index)) {
      continue
    }

    lastBacktickPos = index
  }

  return lastBacktickPos
}

function findClosedCodeBlockEnd(text: string, start: number): number | undefined {
  if (!text.startsWith('```', start))
    return undefined

  const closeIndex = text.indexOf('```', start + 3)
  return closeIndex === -1 ? undefined : closeIndex + 2
}
