export interface SvgIntrinsicSize {
  width: number
  height: number
}

export function getSvgIntrinsicSize(svgElement: SVGSVGElement): SvgIntrinsicSize | null {
  const viewBox = svgElement.getAttribute('viewBox')
  const width = svgElement.getAttribute('width')
  const height = svgElement.getAttribute('height')

  if (viewBox) {
    const parts = viewBox.split(' ')
    if (parts.length === 4) {
      const w = Number.parseFloat(parts[2]!)
      const h = Number.parseFloat(parts[3]!)
      if (isValidSvgSize(w, h))
        return { width: w, height: h }
    }
  }

  if (width && height) {
    const w = Number.parseFloat(width)
    const h = Number.parseFloat(height)
    if (isValidSvgSize(w, h))
      return { width: w, height: h }
  }

  const bbox = svgElement.getBBox()
  if (bbox && isValidSvgSize(bbox.width, bbox.height))
    return { width: bbox.width, height: bbox.height }

  return null
}

export function calculateSvgContainerHeight(
  svgSize: SvgIntrinsicSize,
  containerWidth: number,
): number {
  const aspectRatio = svgSize.height / svgSize.width
  const height = containerWidth * aspectRatio
  return height > svgSize.height ? svgSize.height : height
}

export function measureSvgContainerHeight(
  container: HTMLElement,
  selector: string = '[data-stream-markdown="mermaid"] svg',
): number | null {
  const svgElement = container.querySelector(selector) as SVGSVGElement | null
  if (!svgElement)
    return null

  const svgSize = getSvgIntrinsicSize(svgElement)
  if (!svgSize)
    return null

  return calculateSvgContainerHeight(svgSize, container.getBoundingClientRect().width)
}

function isValidSvgSize(width: number, height: number): boolean {
  return !Number.isNaN(width) && !Number.isNaN(height) && width > 0 && height > 0
}
