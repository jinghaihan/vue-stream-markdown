import type { PreprocessContext } from '../types'
import { getPreprocessAnalysis } from './context'
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
  options?: PreprocessContext,
): string {
  if (!content.includes('~'))
    return content

  const analysis = getPreprocessAnalysis(content, options)
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

  // Check if the content ends with a single ~ (not ~~)
  const endsWithSingleTilde = content.endsWith('~') && !content.endsWith('~~')

  // If ends with single ~, we need to check if it should be completed to ~~
  if (endsWithSingleTilde && !isEscapedCharacter(content, content.length - 1)) {
    // Remove the trailing single ~ and check if we have odd number of ~~
    const contentWithoutLastTilde = content.slice(0, -1)
    const lastParagraphWithoutTilde = contentWithoutLastTilde.split('\n').slice(paragraphStartIndex).join('\n')
    const rangesWithoutTilde = findClosedCodeBlockRanges(lastParagraphWithoutTilde)
    const inlineRangesWithoutTilde = findInlineCodeRanges(lastParagraphWithoutTilde, rangesWithoutTilde)
    const lastParagraphWithoutTildeAndInlineCode = maskInlineCodeMarkdownMarkers(lastParagraphWithoutTilde, inlineRangesWithoutTilde)
    const lastParagraphWithoutTildeAndEscapes = maskEscapedMarkdownMarkers(lastParagraphWithoutTildeAndInlineCode, '~')
    const lastParagraphWithoutTildeAndCodeBlocks = lastParagraphWithoutTildeAndEscapes.replace(codeBlockPattern, '')
    const lastParagraphWithoutTildeAndCodeBlocksAndUrls = removeUrlsFromText(lastParagraphWithoutTildeAndCodeBlocks)
    const matchesWithoutTilde = lastParagraphWithoutTildeAndCodeBlocksAndUrls.match(doubleTildePattern)
    const countWithoutTilde = matchesWithoutTilde ? matchesWithoutTilde.length : 0

    if (countWithoutTilde % 2 === 1) {
      // Odd number of ~~ means we have an unclosed strikethrough
      // But we need to make sure there's actual content after the last ~~
      const lastTildePos = lastParagraphWithoutTildeAndCodeBlocksAndUrls.lastIndexOf('~~')
      if (lastTildePos >= 0) {
        const afterLastTilde = lastParagraphWithoutTildeAndCodeBlocksAndUrls.substring(lastTildePos + 2)
        // Only complete if there's actual content (including whitespace, but not empty)
        if (afterLastTilde.length > 0) {
          return `${content}~`
        }
      }
    }
    // A single tilde is literal text in our Markdown grammar. Preserve it when
    // it is not completing an already-open double-tilde deletion marker.
    return content
  }

  // Only complete if:
  // 1. Odd number of ~~ (unclosed)
  // 2. There's actual content after the last ~~ (not just `~~` alone)
  if (count % 2 === 1) {
    // Find the last ~~ in original lastParagraph, skipping code blocks
    let actualLastTildePos = -1
    let inCodeBlock = false
    for (let i = 0; i < lastParagraph.length - 1; i++) {
      // Check for code block fences
      if (lastParagraph.substring(i, i + 3) === '```') {
        inCodeBlock = !inCodeBlock
        i += 2 // Skip the next two backticks
        continue
      }
      // Skip if inside code block
      if (inCodeBlock) {
        continue
      }
      // Check for ~~
      if (lastParagraph.substring(i, i + 2) === '~~') {
        if (isPositionInRanges(i, inlineCodeRanges)
          || lastParagraphWithoutEscapedTildes.substring(i, i + 2) !== '~~') {
          i += 1
          continue
        }
        actualLastTildePos = i
        i += 1 // Skip the second ~
      }
    }
    if (actualLastTildePos === -1) {
      return content
    }
    const absoluteLastTildePos = paragraph.startOffset + actualLastTildePos

    // Check if the tilde is in math block, link/image URL, or HTML tag
    if (isWithinMathBlock(content, absoluteLastTildePos) || isWithinLinkOrImageUrl(content, absoluteLastTildePos) || isWithinHtmlTag(content, absoluteLastTildePos)) {
      // Don't process if inside math block, link/image URL, or HTML tag
      return content
    }

    const afterLast = lastParagraphWithoutCodeBlocksAndUrls.substring(lastParagraphWithoutCodeBlocksAndUrls.lastIndexOf('~~') + 2)
    const afterLastTrimmed = afterLast.trim()

    // If there's content after ~~, complete it
    if (afterLastTrimmed.length > 0) {
      return `${content}~~`
    }
    else {
      const beforeTilde = content.substring(0, content.length - afterLast.length - 2)
      return beforeTilde.trimEnd()
    }
  }

  return content
}
