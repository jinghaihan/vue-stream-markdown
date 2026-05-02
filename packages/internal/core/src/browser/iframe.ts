export function getIframeBodyHeight(
  iframe: HTMLIFrameElement | undefined,
  offset: number = 16,
): number {
  const doc = iframe?.contentDocument
  if (!doc)
    return 0
  return doc.body.scrollHeight + offset
}
