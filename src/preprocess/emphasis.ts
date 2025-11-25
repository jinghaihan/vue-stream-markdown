import { doubleAsteriskPattern, doubleUnderscorePattern, singleAsteriskPattern, singleUnderscorePattern } from './pattern'

/**
 * Fix unclosed emphasis (* or _) syntax in streaming markdown
 *
 * Only processes the last paragraph (content after the last blank line).
 * This respects Markdown's rule that emphasis cannot span across paragraphs.
 */
export function fixEmphasis(content: string): string {
  // Find the last paragraph
  const lines = content.split('\n')
  let paragraphStartIndex = 0

  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '') {
      paragraphStartIndex = i + 1
      break
    }
  }

  const lastParagraph = lines.slice(paragraphStartIndex).join('\n')

  // Check asterisk emphasis first (original behavior)
  // Remove ** to count only single *
  const withoutDoubleAsterisk = lastParagraph.replace(doubleAsteriskPattern, '')
  const asteriskMatches = withoutDoubleAsterisk.match(singleAsteriskPattern)
  const asteriskCount = asteriskMatches ? asteriskMatches.length : 0

  // Only complete if odd number and has content after
  if (asteriskCount % 2 === 1) {
    const lastStarPos = withoutDoubleAsterisk.lastIndexOf('*')
    const afterLast = withoutDoubleAsterisk.substring(lastStarPos + 1).trim()

    if (afterLast.length > 0)
      return `${content}*`
    else
      // Remove the trailing * to avoid showing it as plain text
      return content.slice(0, -1)
  }

  // If no asterisk emphasis to complete, check underscore emphasis
  // Remove __ to count only single _
  const withoutDoubleUnderscore = lastParagraph.replace(doubleUnderscorePattern, '')
  const underscoreMatches = withoutDoubleUnderscore.match(singleUnderscorePattern)
  const underscoreCount = underscoreMatches ? underscoreMatches.length : 0

  // Only complete if odd number and has content after
  if (underscoreCount % 2 === 1) {
    const lastUnderscorePos = withoutDoubleUnderscore.lastIndexOf('_')
    const afterLast = withoutDoubleUnderscore.substring(lastUnderscorePos + 1).trim()

    if (afterLast.length > 0)
      return `${content}_`
    else
      // Remove the trailing _ to avoid showing it as plain text
      return content.slice(0, -1)
  }

  return content
}
