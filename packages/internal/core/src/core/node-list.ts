import type { ParsedNode, SyntaxTree } from '@markmend/ast'
import type { AnimationType } from '../types'
import {
  getNodeKey,
  getTransitionName,
  shouldAnimateNode,
} from '../utils'

export interface NodeListModelItem<TNode extends ParsedNode = ParsedNode, TRenderer = unknown> {
  node: TNode
  index: number
  key: string
  renderer: TRenderer | null
  prevNode?: ParsedNode
  nextNode?: ParsedNode
  shouldTransition: boolean
}

export interface NodeListModelOptions<TNode extends ParsedNode = ParsedNode, TRenderer = unknown> {
  nodes?: TNode[]
  blocks?: SyntaxTree[]
  blockIndex?: number
  deep: number
  nodeKey?: string
  nodeRenderers?: Partial<Record<string, TRenderer>>
  enableAnimate: boolean
  animation: AnimationType
}

export interface NodeListModel<TNode extends ParsedNode = ParsedNode, TRenderer = unknown> {
  items: Array<NodeListModelItem<TNode, TRenderer>>
  transitionName: string
}

export function createNodeListModel<TNode extends ParsedNode = ParsedNode, TRenderer = unknown>(
  options: NodeListModelOptions<TNode, TRenderer>,
): NodeListModel<TNode, TRenderer> {
  const nodes = options.nodes ?? []
  const blocks = options.blocks ?? []
  const blockIndex = options.blockIndex ?? 0
  const transitionName = getTransitionName(options.animation)
  const prevBlock = findSiblingBlock(blocks, blockIndex - 1, -1)
  const nextBlock = findSiblingBlock(blocks, blockIndex + 1, 1)

  return {
    transitionName,
    items: nodes.map((node, index) => ({
      node,
      index,
      key: getNodeKey(node, index, options.nodeKey),
      renderer: options.nodeRenderers?.[node.type] ?? null,
      prevNode: getPrevNode(nodes, index, options.deep, prevBlock),
      nextNode: getNextNode(nodes, index, options.deep, nextBlock),
      shouldTransition: options.enableAnimate && shouldAnimateNode(node.type),
    })),
  }
}

function findSiblingBlock(blocks: SyntaxTree[], start: number, step: 1 | -1): SyntaxTree | undefined {
  const block = blocks[start]
  if (!block)
    return undefined
  if (!block.children.length)
    return findSiblingBlock(blocks, start + step, step)
  return block
}

function getPrevNode(
  nodes: ParsedNode[],
  index: number,
  deep: number,
  prevBlock?: SyntaxTree,
): ParsedNode | undefined {
  const current = nodes[index - 1]
  if (current)
    return current
  if (deep > 0)
    return undefined
  return prevBlock?.children[prevBlock.children.length - 1]
}

function getNextNode(
  nodes: ParsedNode[],
  index: number,
  deep: number,
  nextBlock?: SyntaxTree,
): ParsedNode | undefined {
  const current = nodes[index + 1]
  if (current)
    return current
  if (deep > 0)
    return undefined
  return nextBlock?.children[0]
}
