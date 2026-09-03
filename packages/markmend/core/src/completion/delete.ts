import type { CompletionContext } from '../types'
import type { TextRange } from './utils'
import { getCompletionAnalysis } from './context'
import { codeBlockPattern, doubleTildePattern } from './pattern'
import {
  findClosedCodeBlockRanges,
  findInlineCodeRanges,
  hideBareFormattingMarker,
  isEscapedCharacter,
  isPositionInRanges,
  isWithinHtmlTag,
  isWithinLinkOrImageUrl,
  isWithinMathBlock,
  maskEscapedMarkdownMarkers,
  maskInlineCodeMarkdownMarkers,
  removeUrlsFromText,
} from './utils'

/**
 * Fix unclosed strikethrough (~~) syntax in streaming markdown
 *
 * Only processes the last paragraph (content after the last blank line).
 * This respects Markdown's rule that ~~ cannot span across paragraphs.
 *
 * @param content - Markdown content (potentially incomplete in stream mode)
 * @returns Content with auto-completed ~~ if needed
 *
 * @example
 * fixDelete('Hello ~~world')
 * // Returns: 'Hello ~~world~~'
 *
 * @example
 * fixDelete('Para1 ~~deleted~~\n\nPara2 ~~text')
 * // Returns: 'Para1 ~~deleted~~\n\nPara2 ~~text~~'
 *
 * @example
 * fixDelete('List item\n\n~~')
 * // Returns: 'List item' (bare formatting markers are hidden by default)
 */
export function fixDelete(
  content: string,
  options?: CompletionContext,
): string {
  if (!content.includes('~'))
    return content

  const analysis = getCompletionAnalysis(content, options)
  // Don't process if we're inside a code block (unclosed)
  if (analysis.hasUnclosedCodeBlock)
    return content

  const hiddenBareMarker = hideBareFormattingMarker(
    content,
    ['~', '~~'],
    analysis.getLastParagraph().content,
  )
  if (hiddenBareMarker !== undefined)
    return options?.hideBareFormattingMarkers === false ? content : hiddenBareMarker

  // Find the last paragraph (after the last blank line)
  // A blank line is defined as a line with only whitespace
  const paragraph = analysis.getLastParagraph()
  const {
    content: lastParagraph,
    inlineCodeRanges,
    startIndex: paragraphStartIndex,
  } = paragraph
  if (paragraph.isFullyCodeBlock)
    return content

  // Remove code blocks and protect inline code / escaped tildes.
  const lastParagraphWithoutInlineCodeMarkers = maskInlineCodeMarkdownMarkers(lastParagraph, inlineCodeRanges)
  const lastParagraphWithoutEscapedTildes = maskEscapedMarkdownMarkers(lastParagraphWithoutInlineCodeMarkers, '~')
  const lastParagraphWithoutCodeBlocks = lastParagraphWithoutEscapedTildes.replace(codeBlockPattern, '')
  // Remove URLs to avoid counting markdown syntax inside URLs (URLs may contain _, *, ~)
  const lastParagraphWithoutCodeBlocksAndUrls = removeUrlsFromText(lastParagraphWithoutCodeBlocks)

  // Count ~~ in the last paragraph only (excluding code blocks and URLs)
  const matches = lastParagraphWithoutCodeBlocksAndUrls.match(doubleTildePattern)
  const count = matches ? matches.length : 0

  // If ends with single ~, we need to check if it should be completed to ~~
  const trailingSingleTildeResult = completeTrailingSingleTilde(content, paragraphStartIndex)
  if (trailingSingleTildeResult !== undefined)
    return trailingSingleTildeResult

  // Only complete if:
  // 1. Odd number of ~~ (unclosed)
  // 2. There's actual content after the last ~~ (not just `~~` alone)
  if (count % 2 === 1) {
    // Find the last ~~ in original lastParagraph, skipping code blocks
    const actualLastTildePos = findLastTildePosition(
      lastParagraph,
      inlineCodeRanges,
      lastParagraphWithoutEscapedTildes,
    )
    if (actualLastTildePos === -1) {
      return content
    }
    const absoluteLastTildePos = paragraph.startOffset + actualLastTildePos

    // Check if the tilde is in math block, link/image URL, or HTML tag
    if (isWithinMathBlock(content, absoluteLastTildePos) || isWithinLinkOrImageUrl(content, absoluteLastTildePos) || isWithinHtmlTag(content, absoluteLastTildePos)) {
      // Don't process if inside math block, link/image URL, or HTML tag
      return content
    }

    return completeDeleteContent(content, lastParagraphWithoutCodeBlocksAndUrls)
  }

  return content
}

function completeTrailingSingleTilde(content: string, paragraphStartIndex: number): string | undefined {
  if (!content.endsWith('~') || content.endsWith('~~') || isEscapedCharacter(content, content.length - 1))
    return undefined

  const contentWithoutLastTilde = content.slice(0, -1)
  const lastParagraph = contentWithoutLastTilde.split('\n').slice(paragraphStartIndex).join('\n')
  const ranges = findClosedCodeBlockRanges(lastParagraph)
  const inlineRanges = findInlineCodeRanges(lastParagraph, ranges)
  const withoutInlineCode = maskInlineCodeMarkdownMarkers(lastParagraph, inlineRanges)
  const withoutEscapes = maskEscapedMarkdownMarkers(withoutInlineCode, '~')
  const withoutCodeBlocks = withoutEscapes.replace(codeBlockPattern, '')
  const withoutUrls = removeUrlsFromText(withoutCodeBlocks)
  const count = withoutUrls.match(doubleTildePattern)?.length ?? 0

  const lastTildePos = withoutUrls.lastIndexOf('~~')
  if (count % 2 === 1
    && lastTildePos >= 0
    && withoutUrls.substring(lastTildePos + 2).length > 0) {
    return `${content}~`
  }

  return content
}

function findLastTildePosition(
  paragraph: string,
  inlineCodeRanges: TextRange[],
  maskedEscapedTildes: string,
): number {
  let inCodeBlock = false
  let lastTildePos = -1

  for (let index = 0; index < paragraph.length - 1; index += 1) {
    if (paragraph.startsWith('```', index)) {
      inCodeBlock = !inCodeBlock
      index += 2
      continue
    }

    if (inCodeBlock || !paragraph.startsWith('~~', index))
      continue

    if (isPositionInRanges(index, inlineCodeRanges)
      || maskedEscapedTildes.substring(index, index + 2) !== '~~') {
      index += 1
      continue
    }

    lastTildePos = index
    index += 1
  }

  return lastTildePos
}

function completeDeleteContent(content: string, maskedContent: string): string {
  const afterLast = maskedContent.substring(maskedContent.lastIndexOf('~~') + 2)
  if (afterLast.trim().length > 0)
    return `${content}~~`

  return content.substring(0, content.length - afterLast.length - 2).trimEnd()
}
