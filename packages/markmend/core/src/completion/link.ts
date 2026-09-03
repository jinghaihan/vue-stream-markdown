import type { CompletionContext } from '../types'
import { getCompletionAnalysis } from './context'
import { codeBlockPattern, incompleteBracketPattern, incompleteLinkTextPattern, standaloneBracketPattern } from './pattern'
import { findLastNonEmptyLineIndex, isEscapedCharacter } from './utils'

/**
 * Complete incomplete link and image syntax.
 *
 * @param content - Markdown content, potentially incomplete during streaming.
 * @param context - Optional completion context.
 * @returns The content with the applicable completion applied.
 */
export function fixLink(content: string, context?: CompletionContext): string {
  if (!content.includes('['))
    return content

  const analysis = getCompletionAnalysis(content, context)
  // Don't process if we're inside a code block (unclosed)
  if (analysis.hasUnclosedCodeBlock) {
    return content
  }

  if (analysis.isFullyCodeBlock)
    return content

  // Find the last paragraph (after the last blank line)
  const { lines } = analysis
  const paragraph = analysis.getLastParagraph()
  const lastParagraph = paragraph.content

  // Remove code blocks from the last paragraph to avoid processing links inside them
  const lastParagraphWithoutCodeBlocks = lastParagraph.replace(codeBlockPattern, '')

  // Check the last non-empty line for trailing standalone bracket
  // This handles cases where content ends with [\n or [ with trailing whitespace
  // Start from the last line and work backwards to find the last non-empty line
  const lastNonEmptyLineIndex = findLastNonEmptyLineIndex(lines)

  // Process if we found a non-empty line (regardless of paragraph boundaries)
  // This ensures we remove trailing standalone brackets even when content ends with newline
  if (lastNonEmptyLineIndex >= 0) {
    const newLines = removeTrailingStandaloneBracket(lines, lastNonEmptyLineIndex)
    if (newLines)
      return newLines.join('\n')
  }

  // Check for unclosed link/image syntax at the end
  // Using multiple specific patterns to avoid backtracking issues
  // Use lastParagraphWithoutCodeBlocks to avoid matching inside code blocks

  // Pattern 1: [text or ![text - incomplete bracket (no closing ])
  if (incompleteBracketPattern.test(lastParagraphWithoutCodeBlocks)) {
    return `${content}]()`
  }

  // Pattern 2: [text] or ![text] - missing URL part (has ] but no opening ())
  if (incompleteLinkTextPattern.test(lastParagraphWithoutCodeBlocks)) {
    return `${content}()`
  }

  // Pattern 3: incomplete URL after ]( without a closing parenthesis.
  // URL characters such as _, *, and ~ are intentionally left untouched.
  if (hasTrailingIncompleteLinkUrl(lastParagraphWithoutCodeBlocks)) {
    return `${content})`
  }

  return content
}

function hasTrailingIncompleteLinkUrl(content: string): boolean {
  const urlStart = content.lastIndexOf('](')
  if (urlStart === -1 || content.slice(urlStart + 2).includes(')'))
    return false

  let bracketDepth = 0
  for (let index = urlStart; index >= 0; index--) {
    const character = content[index]
    if (isEscapedCharacter(content, index))
      continue
    if (character === ']') {
      bracketDepth += 1
      continue
    }
    if (character !== '[')
      continue
    bracketDepth -= 1
    if (bracketDepth === 0)
      return true
  }
  return false
}

function removeTrailingStandaloneBracket(lines: string[], lineIndex: number): string[] | undefined {
  const lastLine = lines[lineIndex] ?? ''
  const match = lastLine.match(standaloneBracketPattern)
  const bracket = match?.[1]
  if (!bracket)
    return undefined
  const bracketPos = lastLine.lastIndexOf(bracket)
  const newLines = [...lines]
  newLines[lineIndex] = lastLine.substring(0, bracketPos).trimEnd()
  if (newLines[lineIndex + 1]?.trim() === '')
    newLines.splice(lineIndex + 1, 1)
  return newLines
}
