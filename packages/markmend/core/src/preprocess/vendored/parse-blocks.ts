// ported from https://github.com/vercel/streamdown/blob/main/packages/streamdown/lib/parse-blocks.tsx

import { Lexer } from 'marked'

const footnoteReferencePattern = /\[\^[\w-]{1,200}\](?!:)/
const footnoteDefinitionPattern = /\[\^[\w-]{1,200}\]:/
const openingTagPattern = /<([a-z][\w:-]*)[\s>/]/i

const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

const openTagPatternCache = new Map<string, RegExp>()
const closeTagPatternCache = new Map<string, RegExp>()

function getOpenTagPattern(tagName: string): RegExp {
  const normalizedTag = tagName.toLowerCase()
  const cached = openTagPatternCache.get(normalizedTag)
  if (cached)
    return cached

  const pattern = new RegExp(`<${normalizedTag}(?=[\\s>/])[^>]*>`, 'gi')
  openTagPatternCache.set(normalizedTag, pattern)
  return pattern
}

function getCloseTagPattern(tagName: string): RegExp {
  const normalizedTag = tagName.toLowerCase()
  const cached = closeTagPatternCache.get(normalizedTag)
  if (cached)
    return cached

  const pattern = new RegExp(`</${normalizedTag}(?=[\\s>])[^>]*>`, 'gi')
  closeTagPatternCache.set(normalizedTag, pattern)
  return pattern
}

function countNonSelfClosingOpenTags(block: string, tagName: string): number {
  if (voidElements.has(tagName.toLowerCase()))
    return 0

  const matches = block.match(getOpenTagPattern(tagName))
  if (!matches)
    return 0

  let count = 0
  for (const match of matches) {
    if (!match.trimEnd().endsWith('/>'))
      count += 1
  }
  return count
}

function countClosingTags(block: string, tagName: string): number {
  return block.match(getCloseTagPattern(tagName))?.length ?? 0
}

function countDoubleDollars(value: string): number {
  let count = 0
  for (let index = 0; index < value.length - 1; index += 1) {
    if (value[index] === '$' && value[index + 1] === '$') {
      count += 1
      index += 1
    }
  }
  return count
}

export function parseMarkdownIntoBlocks(markdown: string): string[] {
  if (
    footnoteReferencePattern.test(markdown)
    || footnoteDefinitionPattern.test(markdown)
  ) {
    return [markdown]
  }

  const tokens = Lexer.lex(markdown, { gfm: true })
  const mergedBlocks: string[] = []
  const htmlStack: string[] = []
  let previousTokenWasCode = false
  let mergeFollowingSpaceIntoHtml = false

  for (const token of tokens) {
    const currentBlock = token.raw
    const mergedBlocksLength = mergedBlocks.length

    if (mergeFollowingSpaceIntoHtml) {
      mergeFollowingSpaceIntoHtml = false
      if (token.type === 'space' && mergedBlocksLength > 0) {
        mergedBlocks[mergedBlocksLength - 1] += currentBlock
        continue
      }
    }

    if (htmlStack.length > 0) {
      mergedBlocks[mergedBlocksLength - 1] += currentBlock

      const trackedTag = htmlStack.at(-1)!
      const newOpenTags = countNonSelfClosingOpenTags(currentBlock, trackedTag)
      const newCloseTags = countClosingTags(currentBlock, trackedTag)

      for (let index = 0; index < newOpenTags; index += 1)
        htmlStack.push(trackedTag)

      for (let index = 0; index < newCloseTags; index += 1) {
        if (htmlStack.at(-1) === trackedTag)
          htmlStack.pop()
      }
      mergeFollowingSpaceIntoHtml = htmlStack.length === 0
      continue
    }

    if (token.type === 'html' && token.block) {
      const openingTagMatch = currentBlock.match(openingTagPattern)
      if (openingTagMatch?.[1]) {
        const tagName = openingTagMatch[1]
        const openTags = countNonSelfClosingOpenTags(currentBlock, tagName)
        const closeTags = countClosingTags(currentBlock, tagName)
        if (openTags > closeTags)
          htmlStack.push(tagName)
      }
    }

    if (mergedBlocksLength > 0 && !previousTokenWasCode) {
      const previousBlock = mergedBlocks[mergedBlocksLength - 1]!
      if (countDoubleDollars(previousBlock) % 2 === 1) {
        mergedBlocks[mergedBlocksLength - 1] = previousBlock + currentBlock
        continue
      }
    }

    mergedBlocks.push(currentBlock)

    mergeFollowingSpaceIntoHtml = (
      token.type === 'html'
      && Boolean(token.block)
      && htmlStack.length === 0
    )

    if (token.type !== 'space')
      previousTokenWasCode = token.type === 'code'
  }

  return mergedBlocks
}
