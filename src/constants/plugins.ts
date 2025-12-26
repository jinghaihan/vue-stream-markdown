import type { BuiltinPluginContext } from '../types'
import { frontmatterFromMarkdown, frontmatterToMarkdown } from 'mdast-util-frontmatter'
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm'
import { mathFromMarkdown, mathToMarkdown } from 'mdast-util-math'
import { cjkFriendlyExtension } from 'micromark-extension-cjk-friendly'
import { gfmStrikethroughCjkFriendly } from 'micromark-extension-cjk-friendly-gfm-strikethrough'
import { frontmatter } from 'micromark-extension-frontmatter'
import { gfm } from 'micromark-extension-gfm'
import { math } from 'micromark-extension-math'

export const BUILTIN_MICROMARK_EXTENSIONS = {
  gfm: () => gfm(),
  math: (ctx: BuiltinPluginContext) => math({
    singleDollarTextMath: ctx.mdastOptions?.singleDollarTextMath ?? false,
  }),
  frontmatter: () => frontmatter(),
  cjkFriendlyExtension: () => cjkFriendlyExtension(),
  gfmStrikethroughCjkFriendly: () => gfmStrikethroughCjkFriendly(),
} as const

export const BUILTIN_FROM_MDAST_EXTENSIONS = {
  gfmFromMarkdown: () => gfmFromMarkdown(),
  mathFromMarkdown: () => mathFromMarkdown(),
  frontmatterFromMarkdown: () => frontmatterFromMarkdown(),
} as const

export const BUILTIN_TO_MDAST_EXTENSIONS = {
  gfmToMarkdown: () => gfmToMarkdown(),
  mathToMarkdown: () => mathToMarkdown(),
  frontmatterToMarkdown: () => frontmatterToMarkdown(),
} as const
