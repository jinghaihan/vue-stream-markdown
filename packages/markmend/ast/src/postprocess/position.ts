interface PositionableNode {
  children?: PositionableNode[]
  position?: unknown
}

export function omitPositions<T extends PositionableNode>(node: T): T {
  const { children, position: _position, ...nodeWithoutPosition } = node
  if (!children)
    return nodeWithoutPosition as T

  return {
    ...nodeWithoutPosition,
    children: children.map(child => omitPositions(child)),
  } as T
}
