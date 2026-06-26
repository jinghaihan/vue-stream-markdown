export function getIframeBodyHeight(
  iframe: HTMLIFrameElement | undefined,
  offset: number = 16,
): number {
  let doc: Document | null | undefined

  try {
    doc = iframe?.contentDocument
  }
  catch {
    return 0
  }

  if (!doc?.body)
    return 0

  return Math.max(
    doc.documentElement?.scrollHeight ?? 0,
    doc.body.scrollHeight,
    doc.documentElement?.offsetHeight ?? 0,
    doc.body.offsetHeight,
  ) + offset
}
