import { isClient } from '../utils'

export function getDocument(): Document | null {
  if (!isClient())
    return null

  return document
}

export function getDocumentBody(doc?: Document): HTMLElement | null {
  if (!isClient())
    return null

  return (doc ?? document).body
}

export function getDocumentElement(doc?: Document): HTMLElement | null {
  if (!isClient())
    return null

  return (doc ?? document).documentElement
}

export function readDocumentLanguage(doc?: Document): string {
  return getDocumentElement(doc)?.lang ?? ''
}

export function isDocumentElementDark(doc?: Document, className = 'dark'): boolean {
  return getDocumentElement(doc)?.classList.contains(className) ?? false
}

export function isElementInDocumentBody(element: Element, doc?: Document): boolean {
  return getDocumentBody(doc)?.contains(element) ?? false
}

export function isEscapeKeyEvent(event: Event): boolean {
  if (!('key' in event))
    return false

  return event.key === 'Escape' || event.key === 'Esc'
}

export function scrollToElement(
  container: ParentNode,
  selector: string,
  options: ScrollIntoViewOptions = { behavior: 'smooth' },
): boolean {
  const element = container.querySelector(selector)
  if (!element)
    return false

  element.scrollIntoView(options)
  return true
}
