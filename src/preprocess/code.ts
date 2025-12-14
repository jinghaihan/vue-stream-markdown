import {
  codeBlockPattern,
  singleBacktickPattern,
  trailingBackticksPattern,
  trailingWhitespacePattern,
  tripleBacktickPattern,
} from './pattern'

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
  // First, remove trailing incomplete backtick sequences
  // This prevents showing intermediate states like `, ``, or ``` at the end
  const cleaned = removeTrailingIncompleteBackticks(content)
  const wasCleanedUp = cleaned !== content
  content = cleaned

  // Then handle code blocks (triple backticks) - these can span multiple paragraphs
  // But don't complete if we just removed trailing backticks (user is still typing)
  if (!wasCleanedUp)
    content = fixCodeBlock(content)

  // Finally handle inline code (single backticks) - only in last paragraph
  // But don't process if we just cleaned up (user is still typing)
  if (!wasCleanedUp)
    content = fixInlineCode(content)

  return content
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
  const beforeBackticks = content.substring(0, backtickPos)
  const afterBackticks = content.substring(backtickPos + backtickSequence.length)

  // If there's non-whitespace content after the backticks, keep them
  if (afterBackticks.trim().length > 0)
    return content

  // For single backtick `
  if (backtickSequence.length === 1) {
    // Count backticks in the last paragraph before this one
    const lines = beforeBackticks.split('\n')
    let paragraphStartIndex = 0

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i]!
      if (line.trim() === '') {
        paragraphStartIndex = i + 1
        break
      }
    }

    const lastParagraph = lines.slice(paragraphStartIndex).join('\n')

    // Remove code blocks from counting
    const withoutCodeBlocks = lastParagraph.replace(codeBlockPattern, '')

    // Count backticks
    const backticks = withoutCodeBlocks.match(singleBacktickPattern)
    const count = backticks ? backticks.length : 0

    // Check if we're inside a code block
    const codeBlockMatches = beforeBackticks.match(tripleBacktickPattern)
    const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0

    // If odd number of backticks and not in code block, this ` would close inline code, keep it
    if (count % 2 === 1 && codeBlockCount % 2 === 0)
      return content // Keep it, it's closing inline code

    // Remove the trailing backtick and any trailing spaces on that line
    return beforeBackticks.replace(trailingWhitespacePattern, '') + afterBackticks
  }

  // For double backticks ``
  if (backtickSequence.length === 2) {
    // Always remove ``, it's incomplete (not a valid markdown syntax)
    // Also remove trailing spaces before the ``
    return beforeBackticks.replace(trailingWhitespacePattern, '') + afterBackticks
  }

  // For triple backticks ```
  if (backtickSequence.length === 3) {
    const codeBlockMatches = beforeBackticks.match(tripleBacktickPattern)
    const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0

    // If odd number of ``` before this, keep it (it's closing a code block)
    // If even number, remove it (it's starting a new code block without content)
    if (codeBlockCount % 2 === 1)
      return content // Keep it, it's closing a code block

    // Remove the trailing ``` and any trailing spaces before it
    return beforeBackticks.replace(trailingWhitespacePattern, '') + afterBackticks
  }

  // For more than 3 backticks, remove them
  return beforeBackticks.replace(trailingWhitespacePattern, '') + afterBackticks
}

/**
 * Fix unclosed code blocks (```)
 * Code blocks can span multiple paragraphs, so we check the entire content
 */
function fixCodeBlock(content: string): string {
  // Count code block fences (```)
  const matches = content.match(tripleBacktickPattern)
  const count = matches ? matches.length : 0

  // If odd number of ```, we have an unclosed code block
  if (count % 2 === 1) {
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
    else {
      // Remove the trailing ``` to avoid showing it as plain text
      return content.slice(0, -3)
    }
  }

  return content
}

/**
 * Fix unclosed inline code (`)
 * Only processes the last paragraph (content after the last blank line)
 */
function fixInlineCode(content: string): string {
  // Don't process inline code if we're inside a code block
  // Count code block fences to check if we're inside one
  const codeBlockMatches = content.match(tripleBacktickPattern)
  const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0

  // If odd number of code block fences, we're inside a code block - don't process inline code
  if (codeBlockCount % 2 === 1)
    return content

  // Find the last paragraph
  const lines = content.split('\n')
  let paragraphStartIndex = 0

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]!
    if (line.trim() === '') {
      paragraphStartIndex = i + 1
      break
    }
  }

  const lastParagraph = lines.slice(paragraphStartIndex).join('\n')

  // Remove triple backticks (code blocks) and their content to avoid interference
  // We need to remove complete code blocks from counting
  const withoutCodeBlocks = lastParagraph.replace(codeBlockPattern, '')

  // Count single backticks (excluding triple backticks)
  // We need to be careful not to count backticks that are part of ```
  const backticks = withoutCodeBlocks.match(singleBacktickPattern)
  const count = backticks ? backticks.length : 0

  // Only complete if odd number and has content after
  if (count % 2 === 1) {
    // Find the last unclosed backtick in the original content
    let lastBacktickPos = -1

    for (let i = 0; i < lastParagraph.length; i++) {
      // Skip over code blocks
      if (lastParagraph.substring(i).startsWith('```')) {
        const closeIndex = lastParagraph.indexOf('```', i + 3)
        if (closeIndex !== -1) {
          i = closeIndex + 2 // Skip to after closing ```
          continue
        }
      }

      if (lastParagraph[i] === '`') {
        // Check if it's part of ``` (triple backticks)
        const before = lastParagraph[i - 1] || ''
        const before2 = lastParagraph[i - 2] || ''
        const after = lastParagraph[i + 1] || ''
        const after2 = lastParagraph[i + 2] || ''

        // Skip if this backtick is part of ```
        // Cases: ```, ``, or ``
        const isPartOfTriple = (before === '`' && before2 === '`') // third of ```
          || (before === '`' && after === '`') // middle of ```
          || (after === '`' && after2 === '`') // first of ```

        if (isPartOfTriple)
          continue

        lastBacktickPos = i
      }
    }

    if (lastBacktickPos !== -1) {
      // Calculate actual position in the full content
      const beforeLastParagraph = lines.slice(0, paragraphStartIndex).join('\n')
      const offset = beforeLastParagraph.length > 0 ? beforeLastParagraph.length + 1 : 0
      const actualPos = offset + lastBacktickPos

      const afterLast = content.substring(actualPos + 1).trim()

      // If there's content after `, complete it
      if (afterLast.length > 0)
        return `${content}\``
      else
        // Remove the trailing ` to avoid showing it as plain text
        return content.slice(0, actualPos) + content.slice(actualPos + 1)
    }
  }

  return content
}
