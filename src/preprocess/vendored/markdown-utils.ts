import { flow } from '../../utils'

export function preprocessLaTeX(content: string) {
  if (typeof content !== 'string')
    return content

  const codeBlockRegex = /```[\s\S]*?```/g
  const codeBlocks = content.match(codeBlockRegex) || []
  const escapeReplacement = (str: string) => str.replace(/\$/g, '_TMP_REPLACE_DOLLAR_')
  let processedContent = content.replace(codeBlockRegex, 'CODE_BLOCK_PLACEHOLDER')

  processedContent = flow([
    (str: string) => str.replace(/\\\[(.*?)\\\]/g, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(/\\\[([\s\S]*?)\\\]/g, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(/\\\((.*?)\\\)/g, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(/(^|[^\\])\$(.+?)\$/g, (_, prefix, equation) => `${prefix}$${equation}$`),
  ])(processedContent)

  codeBlocks.forEach((block) => {
    processedContent = processedContent.replace('CODE_BLOCK_PLACEHOLDER', escapeReplacement(block))
  })

  processedContent = processedContent.replace(/_TMP_REPLACE_DOLLAR_/g, '$')

  return processedContent
}
