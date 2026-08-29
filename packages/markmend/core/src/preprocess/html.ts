import type { PreprocessContext } from '../types'
import { getPreprocessAnalysis } from './context'
import {
  isPositionInRanges,
} from './utils'

const htmlCommentStartPattern = /^<!--[\s\S]*$/
const htmlDoctypePattern = /^<![A-Z][^>]*$/i
const htmlProcessingInstructionPattern = /^<\?[\s\S]*$/
const htmlClosingTagPattern = /^<\/[A-Z][\w-]*\s*$/i
const htmlOpeningTagPattern = /^<[A-Z][\w-]*(?:\s[^<>]*)?$/i
const trailingWhitespacePattern = /\s*$/
const trailingLineWhitespacePattern = /[ \t]+$/

function isUnclosedHtmlFragment(fragment: string): boolean {
  if (!fragment.startsWith('<') || fragment.includes('>'))
    return false

  if (fragment.length <= 1)
    return false

  return htmlCommentStartPattern.test(fragment)
    || htmlDoctypePattern.test(fragment)
    || htmlProcessingInstructionPattern.test(fragment)
    || htmlClosingTagPattern.test(fragment)
    || htmlOpeningTagPattern.test(fragment)
}

/**
 * Remove trailing unclosed HTML-like fragments in stream mode.
 *
 * This prevents incomplete HTML from being emitted as plain text before the
 * parser can recognize it as an HTML node.
 */
export function fixHtml(content: string, context?: PreprocessContext): string {
  if (!content.includes('<'))
    return content

  const analysis = getPreprocessAnalysis(content, context)
  if (analysis.hasUnclosedCodeBlock)
    return content

  const trailingWhitespace = content.match(trailingWhitespacePattern)?.[0] ?? ''
  const visibleEnd = content.length - trailingWhitespace.length
  if (visibleEnd <= 0)
    return content

  const visibleContent = content.slice(0, visibleEnd)
  const fragmentStart = visibleContent.lastIndexOf('<')
  if (fragmentStart === -1)
    return content

  if (fragmentStart > 0 && visibleContent[fragmentStart - 1] === '\\')
    return content

  const fragment = visibleContent.slice(fragmentStart)
  if (!isUnclosedHtmlFragment(fragment))
    return content

  if (isPositionInRanges(fragmentStart, analysis.codeBlockRanges))
    return content

  if (isPositionInRanges(fragmentStart, analysis.inlineCodeRanges))
    return content

  const beforeFragment = content.slice(0, fragmentStart).replace(trailingLineWhitespacePattern, '')
  return `${beforeFragment}${trailingWhitespace}`
}
