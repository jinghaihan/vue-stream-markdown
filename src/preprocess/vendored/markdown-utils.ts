import { flow } from '../../utils'
import {
  blockBracketMathPattern,
  codeBlockPattern,
  dollarPlaceholderPattern,
  inlineBracketMathPattern,
  inlineDollarMathPattern,
  parenMathPattern,
  singleDollarPattern,
} from '../pattern'

export function preprocessLaTeX(content: string) {
  if (typeof content !== 'string')
    return content

  const codeBlocks = content.match(codeBlockPattern) || []
  const escapeReplacement = (str: string) => str.replace(singleDollarPattern, '_TMP_REPLACE_DOLLAR_')
  let processedContent = content.replace(codeBlockPattern, 'CODE_BLOCK_PLACEHOLDER')

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
