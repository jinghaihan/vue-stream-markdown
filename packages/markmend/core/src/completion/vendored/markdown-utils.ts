import { flow } from '../../utils'
import {
  blockBracketMathPattern,
  dollarPlaceholderPattern,
  inlineBracketMathPattern,
  inlineDollarMathPattern,
  parenMathPattern,
  singleDollarPattern,
} from '../pattern'
import { analyzeCodeFences } from '../utils'

export function normalizeLaTeX(content: string) {
  if (typeof content !== 'string')
    return content

  const { ranges, unclosedFence } = analyzeCodeFences(content)
  if (unclosedFence?.marker.startsWith('~'))
    ranges.push({ start: unclosedFence.start, end: content.length })

  const codeBlocks: string[] = []
  let processedContent = ''
  let offset = 0
  for (const { start, end } of ranges) {
    codeBlocks.push(content.slice(start, end))
    processedContent += `${content.slice(offset, start)}CODE_BLOCK_PLACEHOLDER`
    offset = end
  }
  processedContent += content.slice(offset)
  const escapeReplacement = (str: string) => str.replace(singleDollarPattern, '_TMP_REPLACE_DOLLAR_')

  processedContent = flow([
    (str: string) => str.replace(inlineBracketMathPattern, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(blockBracketMathPattern, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(parenMathPattern, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(inlineDollarMathPattern, (_, prefix, equation) => `${prefix}$${equation}$`),
  ])(processedContent)

  codeBlocks.forEach((block) => {
    processedContent = processedContent.replace('CODE_BLOCK_PLACEHOLDER', escapeReplacement(block))
  })

  processedContent = processedContent.replace(dollarPlaceholderPattern, '$')

  return processedContent
}
