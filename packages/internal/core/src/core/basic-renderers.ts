import type {
  FootnoteDefinitionNode,
  FootnoteReferenceNode,
  HeadingNode,
  ListItemNode,
  ListNode,
  ParagraphNode,
  ParsedNode,
  YamlNode,
} from '@markmend/ast'
import { isPlainTextNodeType } from '../utils'

export interface ParagraphModelOptions {
  node: ParagraphNode
  parentNode?: ParsedNode
  nextNode?: ParsedNode
  deep: number
}

export function createParagraphModel(options: ParagraphModelOptions) {
  const parentNodeType = options.parentNode?.type
  const nextNodeType = options.nextNode?.type
  const marginBottom = parentNodeType !== 'listItem' && nextNodeType === 'list'
    ? '0.5rem'
    : ''
  const nodeTypes = collectNodeTypes(options.node.children)
  const lineHeight = options.deep === 0 && nodeTypes.every(isPlainTextNodeType)
    ? 1.75
    : ''

  return {
    marginBottom,
    lineHeight,
  }
}

export function createHeadingModel(node: HeadingNode) {
  const depth = node.depth

  return {
    depth,
    tag: `h${depth}`,
    id: `heading-${depth}`,
  }
}

export function createListModel(node: ListNode) {
  const isTaskList = node.children.some(child => typeof (child as ListItemNode).checked === 'boolean')
  const tag = node.ordered ? 'ol' : 'ul'
  const id = isTaskList
    ? 'task-list'
    : node.ordered ? 'ordered-list' : 'unordered-list'

  return {
    isTaskList,
    tag,
    id,
  }
}

export function createListItemModel(node: ListItemNode) {
  return {
    isTaskListItem: typeof node.checked === 'boolean',
    checked: !!node.checked,
  }
}

export function createYamlTableModel(node: YamlNode) {
  const data = node.value
    .trim()
    .split('\n')
    .map(line => line.split(/\s*:\s*/))

  return {
    data,
    headers: data.map(line => line[0]),
    rows: [{ children: data.map(line => line[1]) }],
  }
}

export function createFootnoteReferenceModel(node: FootnoteReferenceNode) {
  const id = node.identifier
  const label = node.label ?? id

  return {
    id,
    label,
  }
}

export function createFootnoteDefinitionModel(node: FootnoteDefinitionNode) {
  const id = node.identifier
  const label = node.label ?? id

  return {
    id,
    label,
    title: `${label}.`,
  }
}

function collectNodeTypes(nodes: ParsedNode[]): string[] {
  const types = new Set<string>()

  visitNodes(nodes, (node) => {
    types.add(node.type)
  })

  return Array.from(types)
}

function visitNodes(nodes: ParsedNode[], visit: (node: ParsedNode) => void) {
  nodes.forEach((node) => {
    visit(node)
    const children = (node as ParsedNode & { children?: ParsedNode[] }).children
    if (Array.isArray(children))
      visitNodes(children, visit)
  })
}
