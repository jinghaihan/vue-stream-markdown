import type { BuiltinPluginFactory, ParsedNode } from './types'

const MIDDLE_DOLLAR_PATTERN = /[^$]\$[^$]/
const START_DOLLAR_PATTERN = /^\$[^$]/
const END_DOLLAR_PATTERN = /[^$]\$$/

export function flow<T>(fns: Array<(arg: T) => T>): (arg: T) => T {
  return (input: T) => fns.reduce((acc, fn) => fn(acc), input)
}

export function resolveBuiltinExtensions<
  Builtins extends Record<string, BuiltinPluginFactory<Ctx, any>>,
  Ctx,
  Key extends keyof Builtins,
  Ext = ReturnType<Builtins[Key]> extends (infer U)[]
    ? U
    : ReturnType<Builtins[Key]>,
>(
  builtins: Builtins,
  ctx: Ctx,
  control?: Partial<Record<Key, false | BuiltinPluginFactory<Ctx, Ext>>>,
  extend?: Ext[],
): Ext[] {
  const result: Ext[] = []

  for (const key in builtins) {
    const action = control?.[key as unknown as Key]
    if (action === false)
      continue

    const factory = typeof action === 'function'
      ? action
      : builtins[key]
    if (!factory || typeof factory === 'boolean')
      continue

    const value = factory(ctx)
    if (Array.isArray(value))
      result.push(...value)
    else
      result.push(value)
  }

  if (extend?.length)
    result.push(...extend)
  return result
}

export function checkMathSyntax(content: string, singleDollarEnabled: boolean = false): boolean {
  const hasDoubleDollar = content.includes('$$')
  const hasSingleDollar
    = singleDollarEnabled
      && (MIDDLE_DOLLAR_PATTERN.test(content)
        || START_DOLLAR_PATTERN.test(content)
        || END_DOLLAR_PATTERN.test(content))
  return hasDoubleDollar || hasSingleDollar
}

export function findLastLeafNode(nodes: ParsedNode[]): ParsedNode | null {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i]
    const nodeWithChildren = node as { children?: ParsedNode[] }
    if (nodeWithChildren.children && nodeWithChildren.children.length > 0) {
      const found = findLastLeafNode(nodeWithChildren.children)
      if (found)
        return found
      continue
    }
    return node ?? null
  }
  return null
}

export function findNodeParent(
  targetNode: ParsedNode,
  nodes: ParsedNode[],
  parent?: { children: ParsedNode[] },
): {
  parent: { children: ParsedNode[] }
  index: number
} | null {
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i] === targetNode && parent)
      return { parent, index: i }

    const node = nodes[i] as { children: ParsedNode[] }
    if (node.children) {
      const result = findNodeParent(
        targetNode,
        node.children,
        node,
      )
      if (result)
        return result
    }
  }
  return null
}
